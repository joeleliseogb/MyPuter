/*
 * Copyright (C) 2024 Puter Technologies Inc.
 *
 * This file is part of Puter.
 *
 * Puter is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
// TODO: database access can be a service
const { ResourceService, RESOURCE_STATUS_PENDING_CREATE } = require('./storage/ResourceService');
const DatabaseFSEntryFetcher = require("./storage/DatabaseFSEntryFetcher");
const { DatabaseFSEntryService } = require('./storage/DatabaseFSEntryService');
const { SizeService } = require('./storage/SizeService');
const { TraceService } = require('../services/TraceService.js');
const FSAccessContext = require('./FSAccessContext.js');
const SystemFSEntryService = require('./storage/SystemFSEntryService.js');
const PerformanceMonitor = require('../monitor/PerformanceMonitor.js');
const { NodePathSelector, NodeUIDSelector, NodeInternalIDSelector } = require('./node/selectors.js');
const FSNodeContext = require('./FSNodeContext.js');
const { AdvancedBase } = require('@heyputer/puter-js-common');
const { Context } = require('../util/context.js');
const { simple_retry } = require('../util/retryutil.js');
const APIError = require('../api/APIError.js');
const { LLMkdir } = require('./ll_operations/ll_mkdir.js');
const { LLCWrite, LLOWrite } = require('./ll_operations/ll_write.js');
const { LLCopy } = require('./ll_operations/ll_copy.js');
const { PermissionUtil, PermissionRewriter, PermissionImplicator } = require('../services/auth/PermissionService.js');
const { DB_WRITE } = require("../services/database/consts");
const { UserActorType } = require('../services/auth/Actor');
const { get_user } = require('../helpers');

class FilesystemService extends AdvancedBase {
    static MODULES = {
        _path: require('path'),
        uuidv4: require('uuid').v4,
        socketio: require('../socketio.js'),
        config: require('../config.js'),
    }

    constructor (args) {
        super(args);
        const { services } = args;

        this.services = services;

        services.registerService('resourceService', ResourceService);
        services.registerService('sizeService', SizeService);
        services.registerService('traceService', TraceService);

        // TODO: [fs:remove-separate-updater-and-fetcher]
        services.set('fsEntryFetcher', new DatabaseFSEntryFetcher({
            services: services,
        }));
        services.registerService('fsEntryService', DatabaseFSEntryService);

        // The new fs entry service
        services.registerService('systemFSEntryService', SystemFSEntryService);

        this.log = services.get('log-service').create('filesystem-service');

        // used by update_child_paths
        this.db = services.get('database').get(DB_WRITE, 'filesystem');

        const info = services.get('information');
        info.given('fs.fsentry').provide('fs.fsentry:path')
            .addStrategy('entry-or-delegate', async entry => {
                if ( entry.path ) return entry.path;
                return await info
                    .with('fs.fsentry:uuid')
                    .obtain('fs.fsentry:path')
                    .exec(entry.uuid);
            });


        // Decorate methods with otel span
        // TODO: language tool for traits; this is a trait
        const span_methods = [
            'write', 'mkdir', 'rm', 'mv', 'cp', 'read', 'stat',
            'mkdir_2',
            'update_child_paths',
        ];
        for ( const method of span_methods ) {
            const original_method = this[method];
            this[method] = async (...args) => {
                const tracer = services.get('traceService').tracer;
                let result;
                await tracer.startActiveSpan(`fs-svc:${method}`, async span => {
                    result = await original_method.call(this, ...args);
                    span.end();
                });
                return result;
            }
        }

        // TODO: eventually FilesystemService will extend BaseService
        // and _init() will be called (and awaited) automatically
        this._init();
    }

    async _init () {
        const svc_permission = this.services.get('permission');
        svc_permission.register_rewriter(PermissionRewriter.create({
            matcher: permission => {
                if ( ! permission.startsWith('fs:') ) return false;
                const [_, specifier] = PermissionUtil.split(permission);
                if ( ! specifier.startsWith('/') ) return false;
                return true;
            },
            rewriter: async permission => {
                const [_, path, ...rest] = PermissionUtil.split(permission);
                console.log('checking path: ', path);
                const node = await this.node(new NodePathSelector(path));
                if ( ! await node.exists() ) {
                    // TOOD: we need a general-purpose error that can have
                    // a user-safe message, instead of using APIError
                    // which is for API errors.
                    throw APIError.create('subject_does_not_exist');
                }
                const uid = await node.get('uid');
                if ( uid === undefined || uid === 'undefined' ) {
                    throw new Error(`uid is undefined for path ${path}`);
                }
                return `fs:${uid}:${rest.join(':')}`;
            },
        }));
        svc_permission.register_implicator(PermissionImplicator.create({
            matcher: permission => {
                return permission.startsWith('fs:');
            },
            checker: async (actor, permission) => {
                if ( !(actor.type instanceof UserActorType) ) {
                    return undefined;
                }

                const [_, uid] = PermissionUtil.split(permission);
                const node = await this.node(new NodeUIDSelector(uid));

                if ( ! await node.exists() ) {
                    return undefined;
                }

                const owner_id = await node.get('user_id');
                
                // These conditions should never happen
                if ( ! owner_id || ! actor.type.user.id ) {
                    throw new Error(
                        'something unexpected happened'
                    );
                }

                if ( owner_id === actor.type.user.id ) {
                    return {};
                }

                return undefined;
            },
        }));
    }

    /**
     * @deprecated - temporary migration method
     */
    get_systemfs () {
        if ( ! this.systemfs_ ) {
            this.systemfs_ = new FSAccessContext();
            this.systemfs_.fsEntryFetcher = this.services.get('fsEntryFetcher');
            this.systemfs_.fsEntryService = this.services.get('fsEntryService');
            this.systemfs_.resourceService = this.services.get('resourceService');
            this.systemfs_.sizeService = this.services.get('sizeService');
            this.systemfs_.traceService = this.services.get('traceService');
            this.systemfs_.services = this.services;
        }
        return this.systemfs_;
    }

    async owrite ({
        node, user, immutable,
        file, tmp, fsentry_tmp,
        message,
    }) {
        const ll_owrite = new LLOWrite();
        return await ll_owrite.run({
            node, user, immutable,
            file, tmp, fsentry_tmp,
            message,
        });
    }

    // REMINDER: There was an idea that FilesystemService implements
    // an interface, and if that ever happens these arguments are
    // important:
    // parent, name, user, immutable, file, message
    async cwrite (parameters) {
        const ll_cwrite = new LLCWrite();
        return await ll_cwrite.run(parameters);
    }

    async mkdir_2 ({parent, name, user, immutable}) {
        const ll_mkdir = new LLMkdir();
        return await ll_mkdir.run({ parent, name, user, immutable });
    }

    async mkshortcut ({ parent, name, user, target }) {

        // Access Control
        {
            const svc_acl = this.services.get('acl');

            if ( ! await svc_acl.check(user, target, 'read') ) {
                throw await svc_acl.get_safe_acl_error(user, target, 'read');
            }

            if ( ! await svc_acl.check(user, parent, 'write') ) {
                throw await svc_acl.get_safe_acl_error(user, parent, 'write');
            }
        }

        if ( ! await target.exists() ) {
            throw APIError.create('shortcut_to_does_not_exist');
        }

        await target.fetchEntry({ thumbnail: true });

        const { _path, uuidv4 } = this.modules;
        const resourceService = this.services.get('resourceService');
        const systemFSEntryService = this.services.get('systemFSEntryService');

        const ts = Math.round(Date.now() / 1000);
        const uid = uuidv4();

        resourceService.register({
            uid,
            status: RESOURCE_STATUS_PENDING_CREATE,
        });

        console.log('registered entry')

        const raw_fsentry = {
            is_shortcut: 1,
            shortcut_to: target.mysql_id,
            is_dir: target.entry.is_dir,
            thumbnail: target.entry.thumbnail,
            uuid: uid,
            parent_uid: await parent.get('uid'),
            path: _path.join(await parent.get('path'), name),
            user_id: user.id,
            name,
            created: ts,
            updated: ts,
            modified: ts,
            immutable: false,
        };

        this.log.debug('creating fsentry', { fsentry: raw_fsentry })

        const entryOp = await systemFSEntryService.insert(raw_fsentry);

        console.log('entry op', entryOp);

        (async () => {
            await entryOp.awaitDone();
            this.log.debug('finished creating fsentry', { uid })
            resourceService.free(uid);
        })();

        const node = await this.node(new NodeUIDSelector(uid));

        const svc_event = this.services.get('event');
        svc_event.emit('fs.create.shortcut', {
            node,
            context: Context.get(),
        });

        return node;
    }

    async mklink ({ parent, name, user, target }) {

        // Access Control
        {
            const svc_acl = this.services.get('acl');

            if ( ! await svc_acl.check(user, parent, 'write') ) {
                throw await svc_acl.get_safe_acl_error(user, parent, 'write');
            }
        }

        // We don't check if the target exists because broken links
        // are allowed.

        const { _path, uuidv4 } = this.modules;
        const resourceService = this.services.get('resourceService');
        const systemFSEntryService = this.services.get('systemFSEntryService');

        const ts = Math.round(Date.now() / 1000);
        const uid = uuidv4();

        resourceService.register({
            uid,
            status: RESOURCE_STATUS_PENDING_CREATE,
        });

        const raw_fsentry = {
            is_symlink: 1,
            symlink_path: target,
            is_dir: 0,
            uuid: uid,
            parent_uid: await parent.get('uid'),
            path: _path.join(await parent.get('path'), name),
            user_id: user.id,
            name,
            created: ts,
            updated: ts,
            modified: ts,
            immutable: false,
        };

        this.log.debug('creating symlink', { fsentry: raw_fsentry })

        const entryOp = await systemFSEntryService.insert(raw_fsentry);

        (async () => {
            await entryOp.awaitDone();
            this.log.debug('finished creating symlink', { uid })
            resourceService.free(uid);
        })();

        const node = await this.node(new NodeUIDSelector(uid));

        const svc_event = this.services.get('event');
        svc_event.emit('fs.create.symlink', {
            node,
            context: Context.get(),
        });

        return node;
    }

    async copy_2 (...a) {
        const ll_copy = new LLCopy();
        return await ll_copy.run(...a);
    }

    async update_child_paths (old_path, new_path, user_id) {
        const monitor = PerformanceMonitor.createContext('update_child_paths');

        if ( ! old_path.endsWith('/') ) old_path += '/';
        if ( ! new_path.endsWith('/') ) new_path += '/';
        // TODO: fs:decouple-tree-storage
        await this.db.write(
            `UPDATE fsentries SET path = CONCAT(?, SUBSTRING(path, ?)) WHERE path LIKE ? AND user_id = ?`,
            [new_path, old_path.length + 1, old_path + '%', user_id]
        );

        const log = this.services.get('log-service').create('update_child_paths');
        log.info(`updated ${old_path} -> ${new_path}`);

        monitor.end();
    }

    /**
     * node() returns a filesystem node using path, uid,
     * or id associated with a filesystem node. Use this
     * method when you need to get a filesystem node and
     * need to collect information about the entry.
     *
     * @param {*} location - path, uid, or id associated with a filesystem node
     * @returns
     */
    async node (selector) {
        if ( typeof selector === 'string' ) {
            if ( selector.startsWith('/') ) {
                selector = new NodePathSelector(selector);
            } else {
                selector = new NodeUIDSelector(selector);
            }
        }

        // TEMP: remove when these objects aren't used anymore
        if (
            typeof selector === 'object' &&
            selector.constructor.name === 'Object'
        ) {
            if ( selector.path ) {
                selector = new NodePathSelector(selector.path);
            } else if ( selector.uid ) {
                selector = new NodeUIDSelector(selector.uid);
            } else {
                selector = new NodeInternalIDSelector(
                    'mysql', selector.mysql_id);
            }
        }

        let fsNode = new FSNodeContext({
            services: this.services,
            selector,
            fs: this
        });
        return fsNode;
    }

    /**
     * get_entry() returns a filesystem entry using
     * path, uid, or id associated with a filesystem
     * node. Use this method when you need to get a
     * filesystem entry but don't need to collect any
     * other information about the entry.
     *
     * @warning The entry returned by this method is not
     * client-safe. Use FSNodeContext to get a client-safe
     * entry by calling it's fetchEntry() method.
     *
     * @param {*} param0 options for getting the entry
     * @param {*} param0.path
     * @param {*} param0.uid
     * @param {*} param0.id please use mysql_id instead
     * @param {*} param0.mysql_id
     */
    async get_entry ({ path, uid, id, mysql_id, ...options }) {
        let fsNode = await this.node({ path, uid, id, mysql_id });
        await fsNode.fetchEntry(options);
        return fsNode.entry;
    }
}

module.exports = {
    FilesystemService
};
