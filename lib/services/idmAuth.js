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
    /*jshint eqeqeq:false */

    var body = JSON.parse(rawBody),
        roles = [];

    for (var i = 0; i < body.organizations.length; i++) {
        if (body.organizations[i].id == organization) {
            for (var j = 0; j < body.organizations[i].roles.length; j++) {
                roles.push(body.organizations[i].roles[j].id);
            }
        }
    }

    if (roles.length === 0) {
        for (var q = 0; q < body.roles.length; q++) {
            roles.push(body.roles[q].id);
        }
    }

    return roles;
}

function extractRoles(req, res, next) {
    var options = {
        url: config.authentication.options.protocol + '://' + config.authentication.options.host + ':' +
            config.authentication.options.port + constants.GET_ROLES_PATH,
        method: 'GET',
        qs: {
            'access_token': req.headers[constants.AUTHORIZATION_HEADER]
        }
    };

    logger.debug('Extracting roles for token', JSON.stringify(options, null, 4));

    request(options, function(error, response, body) {
        if (error) {
            logger.error('Error connecting the IDM for authentication: %s', error.message);
            next(new errors.KeystoneProxyAuthenticationError(error));
        } else if (response.statusCode === 200) {
            logger.debug('Roles response from the IDM: \n%s\n\n', JSON.stringify(body, null, 4));
            req.roles = getRolesFromResponse(response.body, req.headers[constants.PATH_HEADER]);
            next();
        } else {
            logger.error('Role extraction from the IDM rejected with code %s', response.statusCode);
            logger.debug('Error payload: \n%s\n\n', JSON.stringify(body, null, 4));
            next(new errors.KeystoneProxyAuthenticationRejected(response.statusCode));
        }
    });
}

function authenticate(req, res, next) {
    next();
}

exports.extractRoles = extractRoles;
exports.authenticate = authenticate;
