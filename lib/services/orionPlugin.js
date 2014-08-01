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

/**
 * Middleware to calculate what Context Broker action has been received based on the path and the request payload.
 *
 * @param req           Incoming request.
 * @param res           Outgoing response.
 */
function extractCBAction(req, res, callback) {
    if (req.url.toLowerCase().indexOf('/ngsi10/querycontext') >= 0) {
        req.action = 'read';
        callback(null, req, res);
    } else if (req.url.toLowerCase().indexOf('/ngsi10/subscribecontext') >= 0) {
        req.action = 'subscribe';
        callback(null, req, res);
    } else if (req.url.toLowerCase().indexOf('/ngsi9/registercontext') >= 0) {
        req.action = 'register';
        callback(null, req, res);
    } else if (req.url.toLowerCase().indexOf('/nsgi9/discovercontextavailability') >= 0) {
        req.action = 'discover';
        callback(null, req, res);
    } else if (req.url.toLowerCase().indexOf('/ngsi9/subscribecontextavailability') >= 0) {
        req.action = 'subscribe-availability';
        callback(null, req, res);
    } else {
        callback(null, req, res);
    }
}

exports.extractCBAction = extractCBAction;