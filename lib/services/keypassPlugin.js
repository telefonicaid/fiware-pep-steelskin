/*
 * Copyright 2013 Telefonica Investigación y Desarrollo, S.A.U
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
 * please contact with::[daniel.moranjimenez@telefonica.com]
 */

'use strict';

var logger = require('fiware-node-logger'),
    errors = require('../errors');

/**
 * Perseo operation identification table. Each row of the table contains an operation with three fields:
 * the method of the operation, a regular expression to identify the URL, and the action that operation should be
 * assigned.
 */
var keypassOperations = [
    ['GET', /\/pap\/v1\/subject\/.*\/policy\/.*/, 'readPolicy'],
    ['DELETE', /\/pap\/v1\/subject\/.*\/policy\/.*/, 'removePolicy'],
    ['POST', /\/pap\/v1\/subject\/.*/, 'createPolicy'],
    ['GET', /\/pap\/v1\/subject\/.*/, 'listPolicies'],
    ['DELETE', /\/pap\/v1\/subject\/.*/, 'deleteSubjectPolicies'],
    ['DELETE', /\/pap\/v1/, 'deleteTenantPolicies'],
];

/**
 * Middleware to calculate what Keypass action has been received based on the path and the request payload.
 *
 * @param {Object} req           Incoming request.
 * @param {Object} res           Outgoing response.
 */
function extractAction(req, res, callback) {
    logger.debug('Extracting action from URL [%s] and method [%s]', req.url, req.method);

    for (var i = 0; i < keypassOperations.length; i++) {
        if (req.method === keypassOperations[i][0] &&
            req.url.match(keypassOperations[i][1])) {
            req.action = keypassOperations[i][2];
            callback(null, req, res);
            return;
        }
    }

    callback(new errors.ActionNotFound(), req, res);
}

exports.extractAction = extractAction;
