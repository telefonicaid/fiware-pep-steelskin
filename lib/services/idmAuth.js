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

var request = require('request'),
    config = require('../../config'),
    errors = require('../errors'),
    logger = require('logops'),
    async = require('async'),
    apply = async.apply,
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

    logger.debug('Extracting roles for token: %j', options, null, 4);

    request(options, function(error, response, body) {
        if (error) {
            logger.error('Error connecting the IDM for authentication: %s', error.message);
            next(new errors.KeystoneAuthenticationError(error));
        } else if (response.statusCode === 200) {
            logger.debug('Roles response from the IDM: \n%j\n\n', body);
            req.roles = getRolesFromResponse(response.body, req.headers[constants.PATH_HEADER]);
            next();
        } else {
            logger.error('Role extraction from the IDM rejected with code %s', response.statusCode);
            logger.debug('Error payload: \n%j\n\n', body);
            next(new errors.KeystoneAuthenticationRejected(response.statusCode));
        }
    });
}

function authenticate(req, res, next) {
    next();
}

function authenticationProcess(req, res, next) {
    async.series([
        apply(authenticate, req, res),
        apply(extractRoles, req, res)
    ], next);
}

exports.process = authenticationProcess;
