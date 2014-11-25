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

var request = require('request'),
    config = require('../../config'),
    errors = require('../errors'),
    async = require('async'),
    logger = require('fiware-node-logger'),
    constants = require('../constants');

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
    var pepToken = req.token,
        options = {
        url: config.authentication.options.protocol + '://' + config.authentication.options.host + ':' +
            config.authentication.options.port + config.authentication.options.path,
        method: 'GET',
        qs: {
            'user.id': req.userId
        },
        headers: {
            'X-Auth-Token': pepToken
        }
    };

    logger.debug('Extracting roles for token', JSON.stringify(options, null, 4));

    request(options, function retrieveRolesHandler(error, response, body) {
        if (body) {
            logger.debug('Keystone response retrieving roles:\n\n %s', JSON.stringify(body, null, 4));
        }

        if (error) {
            logger.error('Error connecting Keystone for role retrieving: %s', error.message);
            callback(new errors.KeystoneProxyAuthenticationError(error));
        } else if (response.statusCode === 200) {
            logger.debug('Roles response from Keystone: \n%s\n\n', JSON.stringify(body, null, 4));
            callback(null, getRolesFromResponse(response.body, req.subserviceId));
        } else {
            logger.error('Role extraction from Keystone rejected with code %s', response.statusCode);
            logger.debug('Error payload: \n%s\n\n', JSON.stringify(body, null, 4));
            callback(new errors.KeystoneProxyAuthenticationRejected(response.statusCode));
        }
    });

}

/**
 * Get the user data from Keystone, given its token (this request has to be authenticated with the PEP token as well).
 *
 * @param {Object} req               Request the proxy is processing.
 */
function retrieveUser(req, callback) {
    var proxyToken = req.token,
        userToken = req.headers[constants.AUTHORIZATION_HEADER],
        options = {
        url: config.authentication.options.protocol + '://' + config.authentication.options.host + ':' +
            config.authentication.options.port + config.authentication.options.authPath,
        method: 'GET',
        headers: {
            'X-Auth-Token': proxyToken,
            'X-Subject-Token': userToken
        }
    };

    logger.debug('Retrieving user from keystone: ', JSON.stringify(options, null, 4));

    request(options, function(error, response, body) {
        if (body) {
            logger.debug('Keystone response retrieving user:\n\n %s', JSON.stringify(body, null, 4));
        }

        if (error) {
            logger.error('Error connecting Keystone for user retrieving: %s', error.message);
            callback(new errors.KeystoneProxyAuthenticationError(error));
        } else if (response.statusCode === 404) {
            logger.error('Invalid token', error.message);
            callback(new errors.KeystoneProxyAuthenticationRejected(error));
        } else if (response.statusCode === 200) {
            var parsedBody = JSON.parse(body);

            logger.debug('User response from Keystone: \n%s\n\n', JSON.stringify(body, null, 4));
            req.serviceId = parsedBody.token.user.domain.id;
            req.userId = parsedBody.token.user.id;

            callback(null, parsedBody.token.user.id);
        } else {
            logger.error('User extraction from Keystone rejected with code %s', response.statusCode);
            logger.debug('Error payload: \n%s\n\n', JSON.stringify(body, null, 4));
            callback(new errors.KeystoneProxyAuthenticationRejected(response.statusCode));
        }
    });
}

/**
 * Send a request to Keystone to get the UUID corresponding to the subservice name caught from the fiware-servicepath
 * header.
 *
 * @param {Object} req               Request the proxy is processing.
 */
function retrieveSubserviceId(req, callback) {
    /* jshint camelcase: false */
    var proxyToken = req.token,
        domainId = req.serviceId,
        subserviceName = req.headers[constants.PATH_HEADER],
        options = {
        url: config.authentication.options.protocol + '://' + config.authentication.options.host + ':' +
        config.authentication.options.port + '/v3/projects',
        method: 'GET',
        headers: {
            'X-Auth-Token': proxyToken
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
            logger.error('Error connecting Keystone for subservice ID retrieving: %s', error.message);
            callback(new errors.KeystoneProxyAuthenticationError(error));
        } else if (!body || !body.projects || body.projects.length !== 1) {
            logger.error('Couldn\'t find subservice id in Keystone with name %s', subserviceName);
            callback(new errors.KeystoneSubserviceNotFound(subserviceName));
        } else if (response.statusCode === 200) {
            logger.debug('Subservice body response from Keystone: \n%s\n\n', JSON.stringify(body, null, 4));
            req.subserviceId = body.projects[0].id;
            callback(null, body.projects[0].id);
        } else {
            logger.error('Subservice ID retrieval from Keystone rejected with code %s', response.statusCode);
            logger.debug('Error payload: \n%s\n\n', JSON.stringify(body, null, 4));
            callback(new errors.KeystoneProxyAuthenticationRejected(response.statusCode));
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
           req.roles = result;
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

    logger.debug('Authenticating against Keystone', JSON.stringify(options, null, 4));

    request(options, function(error, response, body) {
        if (body) {
            logger.debug('Keystone response authenticating PEP:\n\n %s', JSON.stringify(body, null, 4));
        }

        if (error) {
            logger.error('Error connecting Keystone for role authenticating: %s', error.message);
            next(new errors.KeystoneProxyAuthenticationError(error));
        } else if (response.statusCode === 201 && req.headers['fiware-service'] !== body.token.domain.name) {
            logger.error('Authentication rejected: the token does not match the service');
            next(new errors.KeystoneProxyAuthenticationRejected(401));
        } else if (response.statusCode === 201 && response.headers['x-subject-token']) {
            logger.debug('Authentication to keystone success: \n%s\n\n', JSON.stringify(body, null, 4));
            req.token = response.headers['x-subject-token'];
            next();
        } else {
            logger.error('Authentication rejected with response [%s]', response.statusCode);
            logger.debug('Error payload: \n%s\n\n', JSON.stringify(body, null, 4));
            next(new errors.KeystoneProxyAuthenticationRejected(response.statusCode));
        }
    });
}

exports.extractRoles = extractRoles;
exports.authenticate = authenticate;
