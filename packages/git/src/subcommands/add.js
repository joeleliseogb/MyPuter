/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Puter's Git client.
 *
 * Puter's Git client is free software: you can redistribute it and/or modify
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
import git from 'isomorphic-git';
import path from 'path-browserify';
import { ErrorCodes } from '@heyputer/puter-js-common/src/PosixError.js';
import { find_repo_root } from '../git-helpers.js';

export default {
    name: 'add',
    usage: 'git add [--] [<pathspec>...]',
    description: 'Add file contents to the index.',
    args: {
        allowPositionals: true,
        options: {
        },
    },
    execute: async (ctx) => {
        const { io, fs, env, args } = ctx;
        const { stdout, stderr } = io;
        const { options, positionals } = args;

        const pathspecs = [...positionals];
        if (pathspecs.length === 0) {
            stdout('Nothing specified, nothing added.');
            return;
        }

        const { repository_dir, git_dir } = await find_repo_root(fs, env.PWD);

        await git.add({
            fs,
            dir: repository_dir,
            gitdir: git_dir,
            ignored: false,
            filepath: pathspecs,
            parallel: true,
        });
    }
}
