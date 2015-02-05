/*
 * Copyright 2014 Telefonica Investigación y Desarrollo, S.A.U
 *
 * This file is part of fiware-orion-pep
 *
 * fiware-orion-pep is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * fiware-orion-pep is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with fiware-orion-pep.
 * If not, seehttp://www.gnu.org/licenses/.
 *
 * For those usages not covered by the GNU Affero General Public License
 * please contact with::[iot_support@tid.es]
 */

'use strict';

var logger = require('logops'),
    errors = require('../errors');

/**
 * Perseo operation identification table. Each row of the table contains an operation with three fields:
 * the method of the operation, a regular expression to identify the URL, and the action that operation should be
 * assigned.
 */
var perseoOperations = [
    ['POST', /\/notices\/?/, 'notify'],

    ['GET', /\/rules\/?/, 'readRule'],
    ['GET', /\/rules\/.*/, 'readRule'],
    ['POST', /\/rules\/?/, 'writeRule'],
    ['DELETE', /\/rules\/.*/, 'writeRule'],

    ['GET', /\/m2m\/vrules\/?/, 'readRule'],
    ['GET', /\/m2m\/vrules\/.*/, 'readRule'],
    ['POST', /\/m2m\/vrules\/?/, 'writeRule'],
    ['DELETE', /\/m2m\/vrules\/.*/, 'writeRule'],
    ['PUT', /\/m2m\/vrules\/.*/, 'writeRule']
];

/**
 * Middleware to calculate what Perseo action has been received based on the path and the request payload.
 *
 * @param {Object} req           Incoming request.
 * @param {Object} res           Outgoing response.
 */
function extractAction(req, res, callback) {
    logger.debug('Extracting action from URL [%s] and method [%s]', req.url, req.method);

    for (var i = 0; i < perseoOperations.length; i++) {
        if (req.method === perseoOperations[i][0] &&
            req.path.match(perseoOperations[i][1])) {
            req.action = perseoOperations[i][2];
            callback(null, req, res);
            return;
        }
    }

    callback(new errors.ActionNotFound(), req, res);
}

exports.extractAction = extractAction;
