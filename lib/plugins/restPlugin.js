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

/**
 * Determines what is the requested action based on the request methods.
 *
 * @param {Object}   req           Incoming request.
 * @param {Object}   res           Outgoing response.
 * @param {Function} next          Callback for calling the next middleware. This callback should adhere to the
 *                                 following signature: next(error, req, res) where req and res are the received
 *                                 parameters and error is an Error object in case the request should be rejected
 *                                 or null otherwise.
 */
function extractAction(req, res, next) {
    switch (req.method) {
        case 'POST':
            req.action = 'create';
            break;
        case 'DELETE':
            req.action = 'delete';
            break;
        case 'PUT':
            req.action = 'update';
            break;
        case 'GET':
            req.action = 'read';
            break;
        default:
            req.action = null;
    }

    req.resourceUrl = req.path;

    next(null, req, res);
}

exports.extractAction = extractAction;
