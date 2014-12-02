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

var request = require('request'),
    config = require('../../config'),
    errors = require('../errors'),
    async = require('async'),
    apply = async.apply,
    logger = require('fiware-node-logger'),
    constants = require('../constants'),
    NodeCache = require( "node-cache" ),
    userCache = new NodeCache({
        stdTTL: 1000,
        checkperiod: 120
    }),
    projectCache = new NodeCache({
        stdTTL: 1000,
        checkperiod: 120
    }),
    waitingRequests = new (require('events').EventEmitter)(),
    authenticating = false,
    currentToken;


/**
 * Extract the error message from an error, based on the attributes existing in the error object.
 *
 * @param {Object} error        Error object to extract the message from.
 * @return {String}             String message corresponding to the error.
 */
function getKeystoneError(error) {
    var message = 'Unknown';

    if (error.message) {
        message = error.message;
    } else if (error.error && error.error.message) {
        message = error.error.message;
    }

    return message;
}

function getRolesFromResponse(rawBody, organization) {
    /* jshint camelcase: false */

    var body = JSON.parse(rawBody),
        roles = [];

    for (var i = 0; i < body.role_assignments.length; i++) {
        if (String(body.role_assignments[i].scope.project.id) === String(organization)) {
            roles.push(body.role_assignments[i].role.id);
        }
    }

    return roles;
}

/**
 * Get all the roles in the subservice for the user, given the PEP Token and the user ID.
 *
 * @param {Object} req               Request the proxy is processing.
 */
function retrieveRoles(req, callback) {
    var options = {
        url: config.authentication.options.protocol + '://' + config.authentication.options.host + ':' +
            config.authentication.options.port + config.authentication.options.path,
        method: 'GET',
        qs: {
            'user.id': req.userId
        },
        headers: {
            'X-Auth-Token': currentToken
        }
    };

    logger.debug('Extracting roles for token', JSON.stringify(options, null, 4));

    request(options, function retrieveRolesHandler(error, response, body) {
        if (body) {
            logger.debug('Keystone response retrieving roles:\n\n %s', JSON.stringify(body, null, 4));
        }

        if (error) {
            var message = getKeystoneError(error);
            logger.error('Error connecting Keystone for role retrieving: %s', message);
            callback(new errors.KeystoneProxyAuthenticationError(message));
        } else if (response.statusCode === 200) {
            logger.debug('Roles response from Keystone: \n%s\n\n', JSON.stringify(body, null, 4));
            callback(null, getRolesFromResponse(response.body, req.subserviceId));
        } else {
            currentToken = null;
            logger.error('Role extraction from Keystone rejected with code %s', response.statusCode);
            logger.debug('Error payload: \n%s\n\n', JSON.stringify(body, null, 4));
            callback(new errors.KeystoneProxyAuthenticationError(500));
        }
    });
}

/**
 * Get the user data from Keystone, given its token (this request has to be authenticated with the PEP token as well).
 *
 * @param {Object} req               Request the proxy is processing.
 */
function retrieveUser(req, callback) {
    var userToken = req.headers[constants.AUTHORIZATION_HEADER];

    var cachedValue = userCache.get(userToken);
    if (cachedValue[userToken]) {
        req.serviceId = cachedValue[userToken].serviceId;
        req.userId = cachedValue[userToken].userId;
        callback(null, req.userId);
    } else {
        var options = {
                url: config.authentication.options.protocol + '://' + config.authentication.options.host + ':' +
                config.authentication.options.port + config.authentication.options.authPath,
                method: 'GET',
                json: {},
                headers: {
                    'X-Auth-Token': currentToken,
                    'X-Subject-Token': userToken
                }
            };

        logger.debug('Retrieving user from keystone: ', JSON.stringify(options, null, 4));

        request(options, function(error, response, body) {
            if (body) {
                logger.debug('Keystone response retrieving user:\n\n %s', JSON.stringify(body, null, 4));
            }

            if (error) {
                var message = getKeystoneError(error);

                logger.error('Error connecting Keystone for user retrieving: %s', message);
                callback(new errors.KeystoneProxyAuthenticationError(message));
            } else if (response.statusCode === 404) {
                currentToken = null;
                logger.error('Invalid token: %s', userToken);
                callback(new errors.KeystoneProxyAuthenticationRejected(404));
            } else if (response.statusCode === 200 && req.headers['fiware-service'] !== body.token.user.domain.name) {
                currentToken = null;

                logger.error('Authentication rejected: the token does not match the service');
                callback(new errors.KeystoneProxyAuthenticationRejected(401));
            } else if (response.statusCode === 200) {
                var cachedValue = {
                    serviceId: body.token.user.domain.id,
                    userId: body.token.user.id
                };

                logger.debug('User response from Keystone: \n%s\n\n', JSON.stringify(body, null, 4));

                userCache.set(userToken, cachedValue);

                req.serviceId = cachedValue.serviceId;
                req.userId = cachedValue.userId;
                callback(null, req.userId);
            } else {
                currentToken = null;
                logger.error('User extraction from Keystone rejected with code %s', response.statusCode);
                logger.debug('Error payload: \n%s\n\n', JSON.stringify(body, null, 4));
                callback(new errors.KeystoneProxyAuthenticationError(500));
            }
        });
    }
}

/**
 * Send a request to Keystone to get the UUID corresponding to the subservice name caught from the fiware-servicepath
 * header.
 *
 * @param {Object} req               Request the proxy is processing.
 */
function retrieveSubserviceId(req, callback) {
    /* jshint camelcase: false */
    var domainId = req.serviceId,
        subserviceName = req.headers[constants.PATH_HEADER],
        options = {
        url: config.authentication.options.protocol + '://' + config.authentication.options.host + ':' +
        config.authentication.options.port + '/v3/projects',
        method: 'GET',
        headers: {
            'X-Auth-Token': currentToken
        },
        query: {
            domain_id: domainId,
            name: subserviceName
        },
        json: {}
    };

    logger.debug('Retrieving subservice ID from keystone: ', JSON.stringify(options, null, 4));

    request(options, function(error, response, body) {
        if (body) {
            logger.debug('Keystone response retrieving subservice ID:\n\n %s', JSON.stringify(body, null, 4));
        }

        if (error) {
            var message = getKeystoneError(error);

            logger.error('Error connecting Keystone for subservice ID retrieving: %s', message);
            callback(new errors.KeystoneProxyAuthenticationError(message));
        } else if (!body || !body.projects || body.projects.length === 0) {
            logger.error('Couldn\'t find subservice id in Keystone with name %s', subserviceName);
            callback(new errors.KeystoneSubserviceNotFound(subserviceName));
        } else if (response.statusCode === 200) {
            var project;

            for (var i = 0; i < body.projects.length; i++) {
                if (body.projects[i].name === subserviceName) {
                    project = body.projects[i];
                }
            }

            if (project) {
                logger.debug('Subservice body response from Keystone: \n%s\n\n', JSON.stringify(body, null, 4));
                req.subserviceId = project.id;
                callback(null, project.id);
            } else {
                logger.error('Couldn\'t find subservice id in Keystone with name %s', subserviceName);
                callback(new errors.KeystoneSubserviceNotFound(subserviceName));
            }
        } else {
            currentToken = null;
            logger.error('Subservice ID retrieval from Keystone rejected with code %s. Invalidating token.',
                response.statusCode);

            logger.debug('Error payload: \n%s\n\n', JSON.stringify(body, null, 4));

            callback(new errors.KeystoneProxyAuthenticationError(500));
        }
    });
}

function extractRoles(req, res, next) {
    async.series([
        async.apply(retrieveUser, req),
        async.apply(retrieveSubserviceId, req),
        async.apply(retrieveRoles, req)
    ], function(error, result) {
       if (error) {
           next(error);
       } else if (!result || result.length === 0) {
           next(new errors.KeystoneProxyAuthenticationError(req.headers[constants.PATH_HEADER]));
       } else {
           req.roles = result[2];
           next();
       }
    });
}

/**
 *  Express middleware for authentication of the PEP Proxy against Keystone. The username and password of the PEP
 *  proxy are taken from the config.js file; the domain (service) and project name (subservice) are taken from the
 *  fiware-service and fiware-servicepath headers (extracted in previous middlewares).
 */
function authenticate(req, res, next) {
    if (currentToken === null) {
        var options = {
            url: config.authentication.options.protocol + '://' + config.authentication.options.host + ':' +
            config.authentication.options.port + config.authentication.options.authPath,
            method: 'POST',
            json: {
                auth: {
                    identity: {
                        methods: [
                            'password'
                        ],
                        password: {
                            user: {
                                domain: {
                                    name: config.authentication.domainName
                                },
                                name: config.authentication.user,
                                password: config.authentication.password
                            }
                        }
                    },
                    scope: {
                        domain: {
                            name: config.authentication.domainName
                        }
                    }
                }
            }
        };

        authenticating = true;
        waitingRequests.removeAllListeners('token');
        waitingRequests.on('token', next);

        logger.debug('Authenticating against Keystone', JSON.stringify(options, null, 4));

        request(options, function(error, response, body) {
            authenticating = false;

            if (body) {
                logger.debug('Keystone response authenticating PEP:\n\n %s', JSON.stringify(body, null, 4));
            }

            if (error) {
                var message = getKeystoneError(error);
                logger.error('Error connecting Keystone for role authenticating: %s', message);
                waitingRequests.emit('token', new errors.KeystoneProxyAuthenticationError(message));
            } else if (response.statusCode === 201 && response.headers['x-subject-token']) {
                logger.debug('Authentication to keystone success: \n%s\n\n', JSON.stringify(body, null, 4));
                req.token = response.headers['x-subject-token'];
                currentToken = req.token;
                waitingRequests.emit('token', null);
            } else {
                logger.error('Authentication rejected with response [%s]', response.statusCode);
                logger.debug('Error payload: \n%s\n\n', JSON.stringify(body, null, 4));
                waitingRequests.emit('token', new errors.KeystoneProxyAuthenticationError(500));
            }
        });
    } else if (authenticating) {
        waitingRequests.on('token', next);
    } else {
        next();
    }
}

/**
 * Performs the authentication process. The authentication will perform the optional authentication (will be skipped if
 * the currentToken token is not null. If the authenticaiton succeeds, the roles for the user will be extracted. If
 * there is any problem related with the authentication in the role extraction process, the current token is
 * invalidated.
 *
 * If there is any error contacting with Keystone, the process is retried n times (where n is defined in the config
 * file).
 */
function authenticationProcess(req, res, next) {
    var retries = config.authentication.retries || 3;

    async.retry(retries, async.apply(async.series, [
        apply(authenticate, req, res),
        apply(extractRoles, req, res)
    ]), next);
}

/**
 * Invalidates the current authentication token.
 */
function invalidateToken(callback) {
    currentToken = null;
    callback();
}

function cleanCache() {
    userCache = new NodeCache({
        stdTTL: 1000,
        checkperiod: 120
    });
    projectCache = new NodeCache({
        stdTTL: 1000,
        checkperiod: 120
    });
}

exports.process = authenticationProcess;
exports.invalidate = invalidateToken;
exports.cleanCache = cleanCache;
