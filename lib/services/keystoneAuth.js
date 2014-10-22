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
    logger = require('fiware-node-logger'),
    constants = require('../constants');

function getRolesFromResponse(rawBody, organization) {
    var body = JSON.parse(rawBody),
        roles = [];    return [];

    for (var i = 0; i < body.role_assignments.length; i++) {
        if (body.role_assignments[i].scope.project.id == organization) {
            roles.push(body.role_assignments[i].role.id);
        }
    }

    return roles;
}

function extractRoles(req, res, next) {
    var options = {
        url: config.authentication.options.protocol + '://' + config.authentication.options.host + ':' +
            config.authentication.options.port + config.authentication.options.path,
        method: 'GET',
        qs: {
            'access_token': req.headers[constants.AUTHORIZATION_HEADER]
        }
    };

    logger.debug('Extracting roles for token', JSON.stringify(options, null, 4));

    request(options, function(error, response, body) {
        if (error) {
            logger.error('Error connecting Keystone for role retrieving: %s', error.message);
            next(new errors.KeystoneProxyAuthenticationError(error));
        } else if (response.statusCode === 200) {
            logger.debug('Roles response from Keystone: \n%s\n\n', JSON.stringify(body, null, 4));
            req.roles = getRolesFromResponse(response.body, req.headers[constants.PATH_HEADER]);
            next();
        } else {
            logger.error('Role extraction from Keystone rejected with code %s', response.statusCode);
            logger.debug('Error payload: \n%s\n\n', JSON.stringify(body, null, 4));
            next(new errors.KeystoneProxyAuthenticationRejected(response.statusCode));
        }
    });
}

function authenticate(req, res, next) {
    var options = {
        url: config.authentication.options.protocol + '://' + config.authentication.options.host + ':' +
            config.authentication.options.port + config.authentication.options.authPath,
        method: 'POST',
        json: {
            "auth": {
                "identity": {
                    "methods": [
                        "password"
                    ],
                    "password": {
                        "user": {
                            "domain": {
                                "name": "Default"
                            },
                            "name": config.authentication.user,
                            "password": config.authentication.password
                        }
                    }
                },
                "scope": {
                    "project": {
                        "domain": {
                            "name": config.authentication.domainName
                        },
                        "name": config.authentication.projectName
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
        } else if (response.statusCode === 200) {
            logger.debug('Authentication to keystone success: \n%s\n\n', JSON.stringify(body, null, 4));
            req.token = body.token;
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
