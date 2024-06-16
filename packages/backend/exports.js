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
const CoreModule = require("./src/CoreModule.js");
const { Kernel } = require("./src/Kernel.js");
const DatabaseModule = require("./src/DatabaseModule.js");
const LocalDiskStorageModule = require("./src/LocalDiskStorageModule.js");
const SelfHostedModule = require("./src/SelfHostedModule.js");
const PuterDriversModule = require("./src/PuterDriversModule.js");
const { testlaunch } = require("./src/index.js");
const BaseService = require("./src/services/BaseService.js");
const { Context } = require("./src/util/context.js");


module.exports = {
    helloworld: () => {
        console.log('Hello, World!');
        process.exit(0);
    },
    testlaunch,

    // Kernel API
    BaseService,
    Context,

    Kernel,

    // Pre-built modules
    CoreModule,
    DatabaseModule,
    PuterDriversModule,
    LocalDiskStorageModule,
    SelfHostedModule,
};
