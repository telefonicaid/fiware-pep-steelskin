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

var config = require('../../config'),
    errors = require('../errors'),
    request = require('request'),
    constants = require('../constants'),
    validationHeaders = [
        'fiware-service',
        'fiware-servicepath',
        'x-auth-token'
    ],
    authorizationHeaders = [
        'x-auth-token'
    ],
    winston = require('winston'),
    accessLogger;

/**
 * Middleware to extract the organization data from the request.
 *
 * @param {Object} req           Incoming request.
 * @param {Object} res           Outgoing response.
 * @param {Function} next        Call to the next middleware in the chain.
 */
function extractOrganization(req, res, next) {
    const logger = req.logger;
    if (req.headers[constants.ORGANIZATION_HEADER]) {
        req.organization = req.headers[constants.ORGANIZATION_HEADER];
        req.service = req.headers[constants.ORGANIZATION_HEADER];
        req.subService = req.headers[constants.PATH_HEADER];
        next();
    } else {
        logger.error('[PROXY-GEN-001] Organization headers not found');
        next(new errors.OrganizationNotFound());
    }
}

/**
 * Middleware to extract the user data (usually a token) from the request.
 *
 * @param {Object} req           Incoming request.
 * @param {Object} res           Outgoing response.
 * @param {Function} next        Call to the next middleware in the chain.
 */
function extractUserId(req, res, next) {
    const logger = req.logger;
    if (req.headers[constants.AUTHORIZATION_HEADER]) {
        req.userId = req.headers[constants.AUTHORIZATION_HEADER];
        next();
    } else {
        logger.error('[PROXY-GEN-002] User ID headers not found');
        next(new errors.UserNotFound());
    }
}

/**
 * Generates the FRN to identify the target resource of the request. The FRN is composed of information from the
 * service and subservice headers and some configuration information.
 *
 * @param {Object} req           Incoming request.
 * @param {Object} res           Outgoing response.
 * @param {Function} next        Invokes the next middleware in the chain.
 */
function generateFRN(req, res, next) {
    const logger = req.logger;
    var frn = config.resourceNamePrefix + config.componentName + ':';

    if (req.organization) {
        frn += req.organization + ':';
    } else {
        frn += ':';
    }

    if (req.headers[constants.PATH_HEADER]) {
        frn += req.headers[constants.PATH_HEADER] + ':';
    } else {
        frn += ':';
    }

    if (req.resourceUrl) {
        frn += req.resourceUrl + ':';
    } else {
        frn += ':';
    }

    if (req.entityType) {
        frn += req.entityType;
    } else {
        frn += ':';
    }
    logger.debug('Generated FRN: ', frn);
    req.frn = frn;

    next();
}

/**
 * Redirects the incoming request to the proxied host.
 * read to guess its type.
 *
 * @param {Object} req           Incoming request.
 * @param {Object} res           Outgoing response.
 * @param {Function} next        Invokes the next middleware in the chain.
 */
function sendRequest(req, res, next) {
    const logger = req.logger;
    var options = {
        uri: 'http://' + config.resource.original.host + ':' + config.resource.original.port + req.path,
        qs: req.query,
        method: req.method,
        headers: req.headers
    };

    if (!options.headers[constants.X_FORWARDED_FOR_HEADER] && req.connection.remoteAddress) {
        options.headers[constants.X_FORWARDED_FOR_HEADER] = req.connection.remoteAddress;
    }
    if (!options.headers[constants.CORRELATOR_HEADER] && req.corr) {
        options.headers[constants.CORRELATOR_HEADER] = req.corr;
    }

    if (req.is('*/json')) {
        options.body = JSON.stringify(req.body);
    } else {
        options.body = req.rawBody;
    }

    delete options.headers['content-length'];
    options.headers.connection = 'close';

    res.oldWriteHead = res.writeHead;
    res.writeHead = function(statusCode, reasonPhrase, headers) {
        if (res._headers['transfer-encoding']) {
            delete res._headers['transfer-encoding'];
        }

        res.oldWriteHead(statusCode, reasonPhrase, headers);
    };

    logger.debug('Forwarding request:\n\n%j\n', options);

    req.fwdResponse = request(options).on('error', function handleConnectionError(e) {
        logger.error('Error forwarding the request to target proxy: %s', e.message);

        if (config.dieOnRedirectError) {
            logger.fatal('[PROXY-FATAL-001] Configured to die upon error in a redirection. Stopping process.');

            process.exit(-1);
        } else {
            next(new errors.TargetServerError(e.message));
        }
    });
    next();
}

/**
 * Account Log
 * read to guess its type.
 *
 * @param {Object} req           Incoming request.
 * @param {Object} res           Outgoing response.
 * @param {Function} next        Invokes the next middleware in the chain.
 */
function accountInfo(req, res, next) {
    if ('fwdResponse' in req) {
        if (!accessLogger) {
            accessLogger = new winston.Logger({
                level: 'info',
                transports: [
                    new(winston.transports.File)({
                        filename: config.access.accountFile
                    })
                ]
            });
        }
        req.fwdResponse = req.fwdResponse.on('response', function(res) {
            accessLogger.info('Right Attempt' +
                              ' | ResponseStatus=' + req.fwdResponse.response.statusCode +
                              ' | Token=' + req.headers['x-auth-token'] +
                              ' | Origin=' + req.connection.remoteAddress +
                              ' | UserId=' + req.userId +
                              ' | UserName=' + req.userName +
                              ' | ServiceId=' + req.serviceId +
                              ' | Service=' + req.service +
                              ' | SubServiceId=' + req.subserviceId +
                              ' | SubService=' + req.subService +
                              ' | Action=' + req.action +
                              ' | Date=' + new Date().toJSON());
        });
    }
    next();
}

/**
 * Invoque request and get response. The request is not read with a pipe, as it has been completely
 * read to guess its type.
 *
 * @param {Object} req           Incoming request.
 * @param {Object} res           Outgoing response.
 * @param {Function} next        Invokes the next middleware in the chain.
 */
function sendResponse(req, res, next) {
    req.fwdResponse.pipe(res);
}

/**
 * Generates a middleware that checks for the pressence of the mandatory headers passed as a parameter, returning a
 * MISSING_HEADERS error if any one is not found.
 *
 * @param {Array} mandatoryHeaders      List of headers to check.
 * @return {Function}                  An express middleware that checks for the presence of the headers.
 */
function checkMandatoryHeaders(mandatoryHeaders) {
    return function(req, res, next) {
        var missing = [];

        for (var i = 0; i < mandatoryHeaders.length; i++) {
            if (!req.headers[mandatoryHeaders[i]] || req.headers[mandatoryHeaders[i]].trim() === '') {
                missing.push(mandatoryHeaders[i]);
            }
        }

        if (missing.length !== 0) {
            next(new errors.MissingHeaders(JSON.stringify(missing)));
        } else {
            next();
        }
    };
}

exports.generateFRN = generateFRN;
exports.extractUserId = extractUserId;
exports.extractOrganization = extractOrganization;
exports.sendRequest = sendRequest;
exports.sendResponse = sendResponse;
exports.accountInfo = accountInfo;
exports.checkMandatoryHeaders = checkMandatoryHeaders(validationHeaders);
exports.checkAuthorizationHeader = checkMandatoryHeaders(authorizationHeaders);
