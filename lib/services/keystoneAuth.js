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
        if (body.role_assignments[i].scope.project.id === organization) {
            roles.push(body.role_assignments[i].role.id);
        }
    }

    return roles;
}

function retrieveRoles(pepToken, pathHeader, userId, callback) {
    var options = {
        url: config.authentication.options.protocol + '://' + config.authentication.options.host + ':' +
            config.authentication.options.port + config.authentication.options.path,
        method: 'GET',
        qs: {
            'user.id': userId
        },
        headers: {
            'X-Auth-Token': pepToken
        }
    };

    logger.debug('Extracting roles for token', JSON.stringify(options, null, 4));

    request(options, function(error, response, body) {
        if (error) {
            logger.error('Error connecting Keystone for role retrieving: %s', error.message);
            callback(new errors.KeystoneProxyAuthenticationError(error));
        } else if (response.statusCode === 200) {
            logger.debug('Roles response from Keystone: \n%s\n\n', JSON.stringify(body, null, 4));
            callback(null, getRolesFromResponse(response.body, pathHeader));
        } else {
            logger.error('Role extraction from Keystone rejected with code %s', response.statusCode);
            logger.debug('Error payload: \n%s\n\n', JSON.stringify(body, null, 4));
            callback(new errors.KeystoneProxyAuthenticationRejected(response.statusCode));
        }
    });

}

function retrieveUser(proxyToken, userToken, callback) {
    var options = {
        url: config.authentication.options.protocol + '://' + config.authentication.options.host + ':' +
            config.authentication.options.port + config.authentication.options.authPath,
        method: 'GET',
        headers: {
            'X-Auth-Token': proxyToken,
            'X-Subject-Token': userToken
        }
    };

    logger.debug('Extracting roles for user: ', JSON.stringify(options, null, 4));

    request(options, function(error, response, body) {
        if (error) {
            logger.error('Error connecting Keystone for user retrieving: %s', error.message);
            callback(new errors.KeystoneProxyAuthenticationError(error));
        } else if (response.statusCode === 200) {
            var parsedBody = JSON.parse(body);

            logger.debug('User response from Keystone: \n%s\n\n', JSON.stringify(body, null, 4));
            callback(null, parsedBody.token.user.id);
        } else {
            logger.error('User extraction from Keystone rejected with code %s', response.statusCode);
            logger.debug('Error payload: \n%s\n\n', JSON.stringify(body, null, 4));
            callback(new errors.KeystoneProxyAuthenticationRejected(response.statusCode));
        }
    });
}

function extractRoles(req, res, next) {
    async.waterfall([
        async.apply(retrieveUser, req.token, req.headers[constants.AUTHORIZATION_HEADER]),
        async.apply(retrieveRoles, req.token, req.headers[constants.PATH_HEADER])
    ], function(error, result) {
       if (error) {
           next(error);
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
                                name: 'Default'
                            },
                            name: config.authentication.user,
                            password: config.authentication.password
                        }
                    }
                },
                scope: {
                    project: {
                        domain: {
                            name: req.service
                        },
                        name: req.subService
                    }
                }
            }
        }
    };

    logger.debug('Authenticating against Keystone', JSON.stringify(options, null, 4));

    request(options, function(error, response, body) {
        if (error) {
            logger.error('Error connecting Keystone for role authenticating: %s', error.message);
            next(new errors.KeystoneProxyAuthenticationError(error));
        } else if (response.statusCode === 200 && response.headers['x-subject-token']) {
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
