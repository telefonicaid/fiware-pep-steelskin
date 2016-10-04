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

        case 'APPEND_STRICT':
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
 * @param {Object} field         Field that will be used to extract the type.
 */
function inspectBodyJSON(body, field, callback) {
    if (body && body[field]) {
        var translatedAction = translateAction(body[field]);

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
function inspectBodyV1(req, res, callback) {
    var actionHandler = function actionHandler(error, action) {
        req.action = action;
        callback(error, req, res);
    };

    if (req.is('*/json')) {
        logger.debug('Inspecting JSON body to discover action: \n%j\n\n', req.body);
        inspectBodyJSON(req.body, 'updateAction', actionHandler);
    } else if (req.is('*/xml')) {
        logger.debug('Inspecting XML body to discover action: \n%s\n\n', req.rawBody);
        inspectBodyXML(req.rawBody, actionHandler);
    } else {
        // TODO: raise error if the type is not recognized.
        logger.error('[ORION-PLUGIN-004] Unknown content type: %s', req.headers['content-type']);

        actionHandler(new errors.UnexpectedContentType(req.headers['content-type']));
    }
}

function inspectBodyV2(req, res, callback) {
    var actionHandler = function actionHandler(error, action) {
        req.action = action;
        callback(error, req, res);
    };

    if (req.is('*/json')) {
        logger.debug('Inspecting JSON body to discover action: \n%j\n\n', req.body);
        inspectBodyJSON(req.body, 'actionType', actionHandler);

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

    var match = false;

    logger.debug('Extracting action from the URL "%s"', req.url);

    for (var i = 0; i < identificationTable.length; i++) {
        match = false;

        if (req.method === identificationTable[i][0] &&
            req.path.toLowerCase().match(identificationTable[i][1])) {

            match = true;

            if (identificationTable[i].length >= 4 && req.query) {
                for (var j in identificationTable[i][3]) {
                    if (!req.query[j] ||
                        identificationTable[i][3].hasOwnProperty(j) &&
                        req.query[j].split(',').indexOf(identificationTable[i][3][j]) < 0) {
                        match = false;
                    }
                }
            }

            if (match) {
                req.action = identificationTable[i][2];
                callback(null, req, res);
                return;
            }
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
        inspectBodyV1(req, res, callback);
    } else if (req.path.toLowerCase().match(/\/v2\/op\/update$/)) {
        inspectBodyV2(req, res, callback);
    } else {
        inspectUrl(req, res, callback);
    }
}

exports.extractCBAction = extractCBAction;
