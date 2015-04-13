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

var sax = require('sax'),
    logger = require('logops'),
    errors = require('../errors'),
    identificationTable = require('./orionUrls');


/**
 * Translates the updateAction value to the appropriate action name for the Access Control.
 *
 * @param {String} originalAction        String with the action name.
 * @return {String}                      The string representation of the action name for the Access Control.
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
        errorRaised = false,
        action;

    parser.onerror = function(e) {
        var error = new errors.WrongXmlPayload();

        logger.error('[ORION-PLUGIN-006] Wrong XML Payload. Parsing error: %s', e.message);

        if (!errorRaised) {
            errorRaised = true;
            error.moreInfo = e;
            callback(error);
        }
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
            logger.error('[ORION-PLUGIN-001] Wrong XML Payload. Action not found');

            callback(new errors.WrongXmlPayload());
        }
    };

    try {
        parser.write(body).close();
    } catch (e) {
        var error = new errors.WrongXmlPayload();

        logger.error('[ORION-PLUGIN-002] Wrong XML Payload. Parsing error: %s', e.message);
        callback(error);
    }
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
        logger.error('[ORION-PLUGIN-003] Wrong JSON Payload: updateAction element not found');

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

    if (req.is('*/json')) {
        logger.debug('Inspecting JSON body to discover action: \n%j\n\n', req.body);
        inspectBodyJSON(req.body, actionHandler);
    } else if (req.is('*/xml')) {
        logger.debug('Inspecting XML body to discover action: \n%s\n\n', req.rawBody);
        inspectBodyXML(req.rawBody, actionHandler);
    } else {
        // TODO: raise error if the type is not recognized.
        logger.error('[ORION-PLUGIN-004] Unknown content type: %s', req.headers['content-type']);

        actionHandler(new errors.UnexpectedContentType(req.headers['content-type']));
    }
}

/**
 * Determines what is the requested action based on the request information, knowing that it is a convenience operation.
 *
 * @param {Object} req           Incoming request.
 * @param {Object} res           Outgoing response.
 */
function inspectUrl(req, res, callback) {
    logger.debug('Extracting action from the URL "%s"', req.url);

    for (var i = 0; i < identificationTable.length; i++) {
        if (req.method === identificationTable[i][0] &&
            req.path.toLowerCase().match(identificationTable[i][1])) {
            req.action = identificationTable[i][2];
            callback(null, req, res);
            return;
        }
    }

    logger.error('[ORION-PLUGIN-005] Action not found');
    callback(new errors.ActionNotFound(), req, res);
}

/**
 * Middleware to calculate what Context Broker action has been received based on the path and the request payload.
 *
 * @param {Object} req           Incoming request.
 * @param {Object} res           Outgoing response.
 */
function extractCBAction(req, res, callback) {
    if (req.path.toLowerCase().match(/\/(ngsi10|v1)\/updatecontext$/)) {
        inspectBody(req, res, callback);
    } else {
        inspectUrl(req, res, callback);
    }
}

exports.extractCBAction = extractCBAction;
