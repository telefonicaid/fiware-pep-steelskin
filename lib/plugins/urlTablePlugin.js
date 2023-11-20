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

var errors = require('../errors');

/**
 * Generates a middleware that extracts the action from the request's URL and method using the table passed as a
 * parameter. Each row in the table should contain three elements:
 * - Method
 * - Regular expression to match the URL
 * - Name of the action
 *
 * If URL matches the regular expression and the request has the indicated method, the designated action is included
 * in the request object 'action' attribute.
 *
 * @param {Array} operations        Array of operations to map URLs to actions.
 * @return {Function}               Middleware that extracts the action from the URL and method.
 */
function extractAction(operations) {
    return function(req, res, callback) {
        const logger = req.logger;
        logger.debug('Extracting action from URL [%s] and method [%s]', req.url, req.method);

        for (var i = 0; i < operations.length; i++) {
            if (req.method === operations[i][0] &&
                req.path.match(operations[i][1])) {
                req.action = operations[i][2];
                callback(null, req, res);
                return;
            }
        }

        callback(new errors.ActionNotFound(), req, res);
    };
}

exports.extractAction = extractAction;
