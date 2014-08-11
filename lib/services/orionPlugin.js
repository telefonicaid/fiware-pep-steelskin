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

var sax = require('sax'),
    logger = require('fiware-node-logger'),
    errors = require('../errors');

/**
 * Translates the updateAction value to the appropriate action name for the Keystone Proxy.
 *
 * @param {String} originalAction        String with the action name.
 * @return {String}                      The string representation of the action name for the Keystone Proxy.
 */
function translateAction(originalAction) {
    var action;

    switch (originalAction.toUpperCase()) {
        case 'APPEND':
            action = 'create';
            break;

        case 'UPDATE':
            action = 'update';
            break;

        case 'DELETE':
            action = 'delete';
            break;

        default:
            action = null;
    }

    logger.debug('Discovered action was: %s', action);

    return action;
}

/**
 * Extract the action from an XML body.
 *
 * @param {String} body          Raw string payload.
 */
function inspectBodyXML(body, callback) {
    var parser = sax.parser(true),
        readingAction = false,
        action;

    parser.onerror = function(e) {
        var error = new errors.WrongXmlPayload();

        logger.error('Wrong XML Payload. Parsing error: %s', e.message);

        error.moreInfo = e;
        callback(error);
    };

    parser.ontext = function(t) {
        if (readingAction) {
            if (!action) {
                action = t;
            } else {
                action = action + t;
            }
        }
    };

    parser.onopentag = function(node) {
        if (node.name === 'updateAction') {
            readingAction = true;
        } else {
            readingAction = false;
        }
    };

    parser.onend = function() {
        if (action) {
            var translatedAction = translateAction(action.trim());

            if (translatedAction) {
                callback(null, translatedAction);
            } else {
                callback(new errors.WrongXmlPayload());
            }

        } else {
            logger.error('Wrong XML Payload. Action not found');

            callback(new errors.WrongXmlPayload());
        }
    };

    parser.write(body).close();
}

/**
 * Extract the action from a JSON body.
 *
 * @param {Object} body          Javascript Object with the parsed payload.
 */
function inspectBodyJSON(body, callback) {
    if (body && body.updateAction) {
        var translatedAction = translateAction(body.updateAction);

        if (translatedAction) {
            callback(null, translatedAction);
        } else {
            callback(new errors.WrongJsonPayload());
        }
    } else {
        logger.error('Wrong JSON Payload: updateAction element not found');

        callback(new errors.WrongJsonPayload());
    }
}

/**
 * Determines what kind of body to parse to calculate the action, and invoke the appropriate function.
 *
 * @param {Object} req           Incoming request.
 * @param {Object} res           Outgoing response.
 */
function inspectBody(req, res, callback) {
    var actionHandler = function actionHandler(error, action) {
        req.action = action;
        callback(error, req, res);
    };

    if (req.headers['content-type'] === 'application/json') {
        logger.debug('Inspecting JSON body to discover action: \n%s\n\n', JSON.stringify(req.body, null, 4));
        inspectBodyJSON(req.body, actionHandler);
    } else if (req.headers['content-type'] === 'application/xml' || req.headers['content-type'] === 'text/xml') {
        logger.debug('Inspecting XML body to discover action: \n%s\n\n', req.rawBody);
        inspectBodyXML(req.rawBody, actionHandler);
    } else {
        // TODO: raise error if the type is not recognized.
        logger.error('Unknown content type: %s', req.headers['content-type']);

        actionHandler();
    }
}

/**
 * Determines what is the requested action based on the URL.
 *
 * @param {Object} req           Incoming request.
 * @param {Object} res           Outgoing response.
 */
function inspectUrl(req, res, callback) {
    var error = null;

    logger.debug('Extracting action from the URL "%s"', req.url);

    if (req.url.toLowerCase().indexOf('/ngsi10/querycontext') >= 0) {
        req.action = 'read';
    } else if (req.url.toLowerCase().indexOf('/ngsi10/subscribecontext') >= 0) {
        req.action = 'subscribe';
    } else if (req.url.toLowerCase().indexOf('/ngsi9/registercontext') >= 0) {
        req.action = 'register';
    } else if (req.url.toLowerCase().indexOf('/nsgi9/discovercontextavailability') >= 0) {
        req.action = 'discover';
    } else if (req.url.toLowerCase().indexOf('/ngsi9/subscribecontextavailability') >= 0) {
        req.action = 'subscribe-availability';
    } else {
        logger.error('Action not found');

        error = new errors.ActionNotFound();
    }

    callback(error, req, res);
}

/**
 * Contenienve operation identification table. Each row of the table contains a convenience operation with three fields:
 * the method of the operation, a regular expression to identify the URL, and the action that operation should be
 * assigned.
 */
var convenienceOperations = [
    ['GET', /^\/ngsi9\/contextEntities\/.+\/attributes$/, 'N/A'],
    ['POST', /^\/ngsi9\/contextEntities\/.+\/attributes$/, 'N/A'],
    ['GET', /^\/ngsi9\/contextEntities\/.+\/attributes\/.+/, 'discover'],
    ['POST', /^\/ngsi9\/contextEntities\/.+\/attributes\/.+/, 'register'],
    ['GET', /^\/ngsi9\/contextEntities\/.+\/attributeDomains\/.+/, 'discover'],
    ['POST', /^\/ngsi9\/contextEntities\/.+\/attributeDomains\/.+/, 'register'],
    ['GET', /^\/ngsi9\/contextEntities\/.+/, 'discover'],
    ['POST', /^\/ngsi9\/contextEntities\/.+/, 'register'],
    ['GET', /^\/ngsi9\/contextEntityTypes\/.+\/attributes$/, 'N/A'],
    ['POST', /^\/ngsi9\/contextEntityTypes\/.+\/attributes$/, 'N/A'],
    ['GET', /^\/ngsi9\/contextEntityTypes\/.+\/attributes\/.+/, 'discover'],
    ['POST', /^\/ngsi9\/contextEntityTypes\/.+\/attributes\/.+/, 'register'],
    ['GET', /^\/ngsi9\/contextEntityTypes\/.+\/attributeDomains\/.+/, 'discover'],
    ['POST', /^\/ngsi9\/contextEntityTypes\/.+\/attributeDomains\/.+/, 'register'],
    ['GET', /^\/ngsi9\/contextEntityTypes\/.+/, 'discover'],
    ['POST', /^\/ngsi9\/contextEntityTypes\/.+/, 'register'],
    ['POST', /^\/ngsi9\/contextAvailabilitySubscriptions$/, 'subscribe-availability'],
    ['PUT', /^\/ngsi9\/contextAvailabilitySubscriptions\/.+/, 'subscribe-availability'],
    ['DELETE', /^\/ngsi9\/contextAvailabilitySubscriptions\/.+/, 'subscribe-availability'],
    ['GET', /^\/ngsi10\/contextEntities\/.+\/attributes$/, 'N/A'],
    ['PUT', /^\/ngsi10\/contextEntities\/.+\/attributes$/, 'N/A'],
    ['POST', /^\/ngsi10\/contextEntities\/.+\/attributes$/, 'N/A'],
    ['DELETE', /^\/ngsi10\/contextEntities\/.+\/attributes$/, 'N/A'],
    ['GET', /^\/ngsi10\/contextEntities\/.+\/attributes\/.+/, 'read'],
    ['POST', /^\/ngsi10\/contextEntities\/.+\/attributes\/.+/, 'create'],
    ['PUT', /^\/ngsi10\/contextEntities\/.+\/attributes\/.+/, 'update'],
    ['DELETE', /^\/ngsi10\/contextEntities\/.+\/attributes\/.+/, 'delete'],
    ['GET', /^\/ngsi10\/contextEntities\/.+\/attributes\/.+\/.+/, 'read'],
    ['PUT', /^\/ngsi10\/contextEntities\/.+\/attributes\/.+\/.+/, 'update'],
    ['DELETE', /^\/ngsi10\/contextEntities\/.+\/attributes\/.+\/.+/, 'delete'],
    ['GET', /^\/ngsi10\/contextEntities\/.+\/attributeDomains\/.+/, 'read'],
    ['GET', /^\/ngsi10\/contextEntities\/.+/, 'read'],
    ['PUT', /^\/ngsi10\/contextEntities\/.+/, 'update'],
    ['POST', /^\/ngsi10\/contextEntities\/.+/, 'create'],
    ['DELETE', /^\/ngsi10\/contextEntities\/.+/, 'delete'],
    ['GET', /^\/ngsi10\/contextEntityTypes\/.+\/attributes$/, 'N/A'],
    ['GET', /^\/ngsi10\/contextEntityTypes\/.+\/attributes\/.+/, 'read'],
    ['GET', /^\/ngsi10\/contextEntityTypes\/.+/, 'read'],
    ['GET', /^\/ngsi10\/contextEntityTypes\/.+\/attributeDomains\/.+/, 'read'],
    ['POST', /^\/ngsi10\/contextSubscriptions$/, 'suscribe'],
    ['PUT', /^\/ngsi10\/contextSubscriptions\/.+/, 'suscribe'],
    ['DELETE', /^\/ngsi10\/contextSubscriptions\/.+/, 'suscribe']
];

/**
 * Determines what is the requested action based on the request information, knowing that it is a convenience operation.
 *
 * @param {Object} req           Incoming request.
 * @param {Object} res           Outgoing response.
 */
function inspectConvenience(req, res, callback) {
    for (var i = 0; i < convenienceOperations.length; i++) {
        if (req.method === convenienceOperations[i][0] &&
            req.url.match(convenienceOperations[i][1])) {
            req.action = convenienceOperations[i][2];
            callback(null, req, res);
            return;
        }
    }

    callback(new errors.ActionNotFound(), req, res);
}

/**
 * Determines if the request is a convenience operation.
 *
 * @param {Object} request          Incoming request.
 * @return {Boolean}                True if the request is a convenience operation and false otherwise.
 */
function isConvenienceOperation(request) {
    return request.url.toLowerCase().match(/^\/ngsi(9|10)\/contextentities/) ||
        request.url.toLowerCase().match(/^\/ngsi(9|10)\/contextentitytypes/) ||
        request.url.toLowerCase().match(/^\/ngsi10\/contextsubscriptions/) ||
        request.url.toLowerCase().match(/^\/ngsi9\/contextavailabilitysubscriptions/);
}

/**
 * Middleware to calculate what Context Broker action has been received based on the path and the request payload.
 *
 * @param {Object} req           Incoming request.
 * @param {Object} res           Outgoing response.
 */
function extractCBAction(req, res, callback) {
    if (isConvenienceOperation(req)) {
        inspectConvenience(req, res, callback);
    } else if (req.url.toLowerCase().indexOf('/ngsi10/updatecontext') >= 0) {
        inspectBody(req, res, callback);
    } else {
        inspectUrl(req, res, callback);
    }
}

exports.extractCBAction = extractCBAction;
