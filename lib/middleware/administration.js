/*
 * Copyright 2014 Telefonica Investigación y Desarrollo, S.A.U
 *
 * This file is part of fiware-pep-steelskin
 *
 * fiware-pep-steelskin is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * fiware-pep-steelskin is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with fiware-pep-steelskin.
 * If not, seehttp://www.gnu.org/licenses/.
 *
 * For those usages not covered by the GNU Affero General Public License
 * please contact with::[iot_support@tid.es]
 */

'use strict';

var packageInformation = require('../../package.json'),
    config = require('../../config'),
    logger = require('logops');

function retrieveVersion(req, res, next) {
    res.status(200).json({
        version: packageInformation.version,
        port: config.resource.proxy.port
    });
}

function changeLogLevel(req, res, next) {
    var levels = ['INFO', 'ERROR', 'FATAL', 'DEBUG', 'WARN', 'WARNING'];

    if (!req.query.level) {
        res.status(400).json({
            error: 'log level missing'
        });
    } else if (levels.indexOf(req.query.level.toUpperCase()) < 0) {
        res.status(400).json({
            error: 'invalid log level'
        });
    } else {
        let newLevel = req.query.level.toUpperCase();
        if (newLevel === 'WARNING') {
            newLevel = 'WARN';
        }
        logger.setLevel(newLevel);
        res.status(200).send('');
    }
}

/**
 * Return the current log level.
 */
function getLogLevel(req, res, next) {
    res.status(200).json({
        level: logger.getLevel()
    });
}

function loadContextRoutes(router) {
    router.get('/version', retrieveVersion);
    router.put('/admin/log', changeLogLevel);
    router.get('/admin/log', getLogLevel);
}

exports.loadContextRoutes = loadContextRoutes;
