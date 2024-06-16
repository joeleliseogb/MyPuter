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
const { AdvancedBase } = require("@heyputer/puter-js-common");
const { NotificationES } = require("./om/entitystorage/NotificationES");
const { Context } = require('./util/context');


class CoreModule extends AdvancedBase {
    async install (context) {
        const services = context.get('services');
        const app = context.get('app');
        const useapi = context.get('useapi');
        await install({ services, app, useapi });
    }

    // Some services were created before the BaseService
    // class existed. They don't listen to the init event
    // and the order in which they're instantiated matters.
    // They all need to be installed after the init event
    // is dispatched, so they get a separate install method.
    async install_legacy (context) {
        const services = context.get('services');
        await install_legacy({ services });
    }
}

module.exports = CoreModule;

const install = async ({ services, app, useapi }) => {
    const config = require('./config');

    useapi.withuse(() => {
        def('Service', require('./services/BaseService'));
        def('Module', AdvancedBase);

        def('puter.middlewares.auth', require('./middleware/auth2'));
    });

    // /!\ IMPORTANT /!\
    // For new services, put the import immediate above the
    // call to services.registerService. We'll clean this up
    // in a future PR.

    const { LogService } = require('./services/runtime-analysis/LogService');
    const { PagerService } = require('./services/runtime-analysis/PagerService');
    const { AlarmService } = require('./services/runtime-analysis/AlarmService');
    const { ErrorService } = require('./services/runtime-analysis/ErrorService');
    const { CommandService } = require('./services/CommandService');
    const { ExpectationService } = require('./services/runtime-analysis/ExpectationService');
    const { HTTPThumbnailService } = require('./services/thumbnails/HTTPThumbnailService');
    const { PureJSThumbnailService } = require('./services/thumbnails/PureJSThumbnailService');
    const { NAPIThumbnailService } = require('./services/thumbnails/NAPIThumbnailService');
    const { DevConsoleService } = require('./services/DevConsoleService');
    const { RateLimitService } = require('./services/sla/RateLimitService');
    const { MonthlyUsageService } = require('./services/sla/MonthlyUsageService');
    const { AuthService } = require('./services/auth/AuthService');
    const { SLAService } = require('./services/sla/SLAService');
    const { PermissionService } = require('./services/auth/PermissionService');
    const { ACLService } = require('./services/auth/ACLService');
    const { CoercionService } = require('./services/drivers/CoercionService');
    const { PuterSiteService } = require('./services/PuterSiteService');
    const { ContextInitService } = require('./services/ContextInitService');
    const { IdentificationService } = require('./services/abuse-prevention/IdentificationService');
    const { AuthAuditService } = require('./services/abuse-prevention/AuthAuditService');
    const { RegistryService } = require('./services/RegistryService');
    const { RegistrantService } = require('./services/RegistrantService');
    const { SystemValidationService } = require('./services/SystemValidationService');
    const { EntityStoreService } = require('./services/EntityStoreService');
    const SQLES = require('./om/entitystorage/SQLES');
    const ValidationES = require('./om/entitystorage/ValidationES');
    const { SetOwnerES } = require('./om/entitystorage/SetOwnerES');
    const AppES = require('./om/entitystorage/AppES');
    const WriteByOwnerOnlyES = require('./om/entitystorage/WriteByOwnerOnlyES');
    const SubdomainES = require('./om/entitystorage/SubdomainES');
    const { MaxLimitES } = require('./om/entitystorage/MaxLimitES');
    const { AppLimitedES } = require('./om/entitystorage/AppLimitedES');
    const { ReadOnlyES } = require('./om/entitystorage/ReadOnlyES');
    const { OwnerLimitedES } = require('./om/entitystorage/OwnerLimitedES');
    const { ESBuilder } = require('./om/entitystorage/ESBuilder');
    const { Eq, Or } = require('./om/query/query');
    const { TrackSpendingService } = require('./services/TrackSpendingService');
    const { ServerHealthService } = require('./services/runtime-analysis/ServerHealthService');
    const { MakeProdDebuggingLessAwfulService } = require('./services/MakeProdDebuggingLessAwfulService');
    const { ConfigurableCountingService } = require('./services/ConfigurableCountingService');
    const { FSLockService } = require('./services/fs/FSLockService');
    const { StrategizedService } = require('./services/StrategizedService');
    const WebServerService = require('./services/WebServerService');
    const FilesystemAPIService = require('./services/FilesystemAPIService');
    const ServeGUIService = require('./services/ServeGUIService');
    const PuterAPIService = require('./services/PuterAPIService');
    const { RefreshAssociationsService } = require("./services/RefreshAssociationsService");
    // Service names beginning with '__' aren't called by other services;
    // these provide data/functionality to other services or produce
    // side-effects from the events of other services.

    // === Services which extend BaseService ===
    services.registerService('system-validation', SystemValidationService);
    services.registerService('server-health', ServerHealthService);
    services.registerService('log-service', LogService);
    services.registerService('commands', CommandService);
    services.registerService('web-server', WebServerService, { app });
    services.registerService('__api-filesystem', FilesystemAPIService);
    services.registerService('__api', PuterAPIService);
    services.registerService('__gui', ServeGUIService);
    services.registerService('expectations', ExpectationService);
    services.registerService('pager', PagerService);
    services.registerService('alarm', AlarmService);
    services.registerService('error-service', ErrorService);
    services.registerService('registry', RegistryService);
    services.registerService('__registrant', RegistrantService);
    services.registerService('fslock', FSLockService);
    services.registerService('es:app', EntityStoreService, {
        entity: 'app',
        upstream: ESBuilder.create([
            SQLES, { table: 'app', debug: true, },
            AppES,
            AppLimitedES, {
                // When apps query es:apps, they're allowed to see apps which
                // are approved for listing and they're allowed to see their
                // own entry.
                exception: async () => {
                    const actor = Context.get('actor');
                    return new Or({
                        children: [
                            new Eq({
                                key: 'approved_for_listing',
                                value: 1,
                            }),
                            new Eq({
                                key: 'uid',
                                value: actor.type.app.uid,
                            }),
                        ]
                    });
                },
            },
            WriteByOwnerOnlyES,
            ValidationES,
            SetOwnerES,
            MaxLimitES, { max: 5000 },
        ]),
    });
    services.registerService('es:subdomain', EntityStoreService, {
        entity: 'subdomain',
        upstream: ESBuilder.create([
            SQLES, { table: 'subdomains', debug: true, },
            SubdomainES,
            AppLimitedES,
            WriteByOwnerOnlyES,
            ValidationES,
            SetOwnerES,
            MaxLimitES, { max: 5000 },
        ]),
    });
    services.registerService('es:notification', EntityStoreService, {
        entity: 'notification',
        upstream: ESBuilder.create([
            SQLES, { table: 'notification', debug: true },
            NotificationES,
            OwnerLimitedES,
            ReadOnlyES,
            SetOwnerES,
            MaxLimitES, { max: 200 },
        ]),
    })
    services.registerService('rate-limit', RateLimitService);
    services.registerService('monthly-usage', MonthlyUsageService);
    services.registerService('auth', AuthService);
    services.registerService('permission', PermissionService);
    services.registerService('sla', SLAService);
    services.registerService('acl', ACLService);
    services.registerService('coercion', CoercionService);
    services.registerService('puter-site', PuterSiteService);
    services.registerService('context-init', ContextInitService);
    services.registerService('identification', IdentificationService);
    services.registerService('auth-audit', AuthAuditService);
    services.registerService('spending', TrackSpendingService);
    services.registerService('counting', ConfigurableCountingService);
    services.registerService('thumbnails', StrategizedService, {
        strategy_key: 'engine',
        strategies: {
            napi: [NAPIThumbnailService],
            purejs: [PureJSThumbnailService],
            http: [HTTPThumbnailService],
        }
    });
    services.registerService('__refresh-assocs', RefreshAssociationsService);
    services.registerService('__prod-debugging', MakeProdDebuggingLessAwfulService);
    if ( config.env == 'dev' ) {
        services.registerService('dev-console', DevConsoleService);
    }

    const { EventService } = require('./services/EventService');
    services.registerService('event', EventService);

    const { PuterVersionService } = require('./services/PuterVersionService');
    services.registerService('puter-version', PuterVersionService);

    const { SessionService } = require('./services/SessionService');
    services.registerService('session', SessionService);

    const { EdgeRateLimitService } = require('./services/abuse-prevention/EdgeRateLimitService');
    services.registerService('edge-rate-limit', EdgeRateLimitService);

    const { Emailservice } = require('./services/EmailService');
    services.registerService('email', Emailservice);

    const { TokenService } = require('./services/auth/TokenService');
    services.registerService('token', TokenService);

    const { OTPService } = require('./services/auth/OTPService');
    services.registerService('otp', OTPService);

    const { UserProtectedEndpointsService } = require("./services/web/UserProtectedEndpointsService");
    services.registerService('__user-protected-endpoints', UserProtectedEndpointsService);

    const { AntiCSRFService } = require('./services/auth/AntiCSRFService');
    services.registerService('anti-csrf', AntiCSRFService);

    const { LockService } = require('./services/LockService');
    services.registerService('lock', LockService);

    const { PuterHomepageService } = require('./services/PuterHomepageService');
    services.registerService('puter-homepage', PuterHomepageService);

    const { GetUserService } = require('./services/GetUserService');
    services.registerService('get-user', GetUserService);

    const { DetailProviderService } = require('./services/DetailProviderService');
    services.registerService('whoami', DetailProviderService);

    const { DevTODService } = require('./services/DevTODService');
    services.registerService('__dev-tod', DevTODService);

    const { DriverService } = require("./services/drivers/DriverService");
    services.registerService('driver', DriverService);

    const { ScriptService } = require('./services/ScriptService');
    services.registerService('script', ScriptService);
    
    const { BroadcastService } = require('./services/BroadcastService');
    services.registerService('broadcast', BroadcastService);
    
    const { NotificationService } = require('./services/NotificationService');
    services.registerService('notification', NotificationService);
}

const install_legacy = async ({ services }) => {
    const { ProcessEventService } = require('./services/runtime-analysis/ProcessEventService');
    const { ParameterService } = require('./services/ParameterService');
    const { InformationService } = require('./services/information/InformationService');
    const { FilesystemService } = require('./filesystem/FilesystemService');
    const PerformanceMonitor = require('./monitor/PerformanceMonitor');
    const { OperationTraceService } = require('./services/OperationTraceService');
    const { WSPushService } = require('./services/WSPushService');
    const { ReferralCodeService } = require('./services/ReferralCodeService');
    const { ClientOperationService } = require('./services/ClientOperationService');
    const { EngPortalService } = require('./services/EngPortalService');
    const { AppInformationService } = require('./services/AppInformationService');
    const { FileCacheService } = require('./services/file-cache/FileCacheService');

    // === Services which do not yet extend BaseService ===
    services.registerService('process-event', ProcessEventService);
    services.registerService('params', ParameterService);
    services.registerService('information', InformationService)
    services.registerService('filesystem', FilesystemService);
    services.registerService('operationTrace', OperationTraceService);
    services.registerService('__event-push-ws', WSPushService);
    services.registerService('referral-code', ReferralCodeService);
    services.registerService('file-cache', FileCacheService);
    services.registerService('client-operation', ClientOperationService);
    services.registerService('app-information', AppInformationService);
    services.registerService('engineering-portal', EngPortalService);
    // TODO: add to here: ResourceService and DatabaseFSEntryService

    // This singleton was made before services existed,
    // so we have to pass that to it manually
    PerformanceMonitor.provideServices(services);

};
