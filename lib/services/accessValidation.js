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
    async = require('async'),
    apply = async.apply,
    config = require('../../config'),
    errors = require('../errors'),
    logger = require('fiware-node-logger'),
    mustache = require('mustache'),
    fs = require('fs'),
    requestTemplate;

/**
 * Creates the XACML XML payload with the received parameters. To do so, it makes use of the mustache templates loaded
 * in the loadTemplates() method.
 *
 * @param {String} userToken             OAuth token identifiying the user.
 * @param {String} organization          Name of the organization with the frn format.
 * @param {String} action                Name of the action the request is trying to execute.
g */
function createAccessRequest(userToken, organization, action, callback) {
    var parameters = {
        organization: organization,
        subjectId: userToken,
        action: action
    };

    logger.debug('Creating access request for user [%s], with organization [%s] and action [%s]',
        userToken, organization, action);

    callback(null, mustache.render(requestTemplate, parameters));
}

/**
 * Sends the validation request to the Keystone proxy with the XML payload received.
 *
 * @param {String} token                 Authentication token to authenticate to the Keystone Proxy.
 * @param {String} accessPayload         XACML payload in string format.
 */
function sendAccessRequest(token, accessPayload, callback) {
    var options = {
        uri: config.access.protocol + '://' + config.access.host + ':' + config.access.port + config.access.path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/xml',
            'Accept': 'application/xml',
            'X-Auth-Token': token
        },
        body: accessPayload
    };

    logger.debug('Sending access request: \n%s\n', JSON.stringify(options, null, 4));

    request(options, function processResponse(error, response, body) {
        if (error) {
            logger.error('Error connecting to Keystone Proxy: %d', error.message);
            callback(new errors.KeystoneProxyConnectionError(error));
        } else if (response.statusCode === 403) {
            logger.debug('Request access denied');
            callback(new errors.AccessDenied());
        } else if (response.statusCode !== 200) {
            logger.error('Wrong status received by Keystone Proxy: %d', response.statusCode);
            logger.debug('Error body: \n%s\n\n', body);
            callback(new errors.KeystoneProxyValidationError('Wrong status code received: ' + response.statusCode));
        } else {
            logger.debug('Request access accepted');
            callback(null, body);
        }
    });
}

/**
 * Launches the validation process for the incoming request. As all the other middlewares in the proxy, it should chain
 * the received req and res to the next one in the callback invocation.
 *
 * @param {Object} req           Incoming request.
 * @param {Object} res           Outgoing response.
 * @param {Function} next        Call to the next middleware in the chain.
 */
function validationProcess(req, res, next) {
    async.waterfall([
        apply(createAccessRequest, req.userId, req.organization, req.action),
        apply(sendAccessRequest, req.authenticationToken.id)
    ], next);
}

/**
 *  Load the XML Templates for generating the validation requests. This method has to be called just once when the
 *  proxy has started, and the templates themselves are reused for every request.
 */
function loadTemplates(callback) {
    logger.debug('Loading access validation Templates');

    fs.readFile('./lib/templates/validationRequest.xml', 'utf8', function templateLoaded(error, templateData) {
        if (error) {
            logger.fatal('Validation Request templates not found');
            callback(errors.TemplateLoadingError(error));
        } else {
            requestTemplate = templateData;
            callback();
        }
    });
}

function authenticateProxy(req, res, next) {
    var options = {
        url: config.authentication.protocol + '://' + config.authentication.host + ':' + config.authentication.port +
            config.authentication.path,
        method: 'POST',
        json: {
            auth: {
                passwordCredentials: {
                    username: config.authentication.username,
                    password: config.authentication.password
                }
            }
        }
    };

    logger.debug('Authenticating to the Keystone Proxy with body', JSON.stringify(options, null, 4));

    request(options, function(error, response, body) {
        if (error) {
            logger.error('Error connecting the Keystone Proxy for authentication: %s', error.message);
            next(new errors.KeystoneProxyAuthenticationError(error));
        } else if (response.statusCode === 200) {
            logger.debug('Authentication response from the Keystone Proxy: \n%s\n\n', JSON.stringify(body, null, 4));
            req.authenticationToken = body.access.token;
            next();
        } else {
            logger.error('Authentication to the Keystone Proxy rejected with code %s', response.statusCode);
            logger.debug('Error payload: \n%s\n\n', JSON.stringify(body, null, 4));
            next(new errors.KeystoneProxyAuthenticationRejected(response.statusCode));
        }
    });
}

exports.authenticate = authenticateProxy;
exports.validate = validationProcess;
exports.init = loadTemplates;
