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
    constants = require('../constants'),
    mustache = require('mustache'),
    sax = require('sax'),
    fs = require('fs'),
    requestTemplate,
    roleTemplate;

/**
 * Creates the XACML XML payload with the received parameters. To do so, it makes use of the mustache templates loaded
 * in the loadTemplates() method.
 *
 * @param {String} roles                 List of the roles of the user.
 * @param {String} organization          Name of the organization with the frn format.
 * @param {String} action                Name of the action the request is trying to execute.
g */
function createAccessRequest(roles, organization, action, callback) {
    var parameters = {
        organization: organization,
        action: action,
        roles: ''
    };

    logger.debug('Creating access request for user [%s], with organization [%s] and action [%s]',
        JSON.stringify(roles), organization, action);

    for (var i = 0; i < roles.length; i++) {
        var roleParameters = {
            roleId: roles[i]
        };

        parameters.roles = parameters.roles + mustache.render(roleTemplate, roleParameters);
    }

    callback(null, mustache.render(requestTemplate, parameters));
}

/**
 * Parse the response received from the Keystone proxy. This response is an XACML Response object, containing only a
 * single useful field, "DECISION", that contains the decision about the user validation. This function parse the XML
 * body and extracts the current decision.
 *
 * @param {Object} body          Response body in text format.
 */
function parseResponse(body, callback) {
    var parser = sax.parser(true),
        readingDecision = false,
        decision;

    parser.onerror = function(e) {
        var error = new errors.WrongXmlPayload();

        error.moreInfo = e;
        callback(error);
    };

    parser.ontext = function(t) {
        if (readingDecision) {
            if (!decision) {
                decision = t;
            } else {
                decision = decision + t;
            }
        }
    };

    parser.onopentag = function(node) {
        if (node.name.toUpperCase() === 'DECISION') {
            readingDecision = true;
        } else {
            readingDecision = false;
        }
    };

    parser.onend = function() {
        if (decision) {
            callback(null, decision.trim());
        } else {
            callback(new errors.WrongXmlPayload());
        }
    };

    parser.write(body).close();
}

/**
 * Sends the validation request to the Keystone proxy with the XML payload received.
 *
 * @param {String} accessPayload         XACML payload in string format.
 */
function sendAccessRequest(accessPayload, callback) {
    var options = {
        uri: config.access.protocol + '://' + config.access.host + ':' + config.access.port + config.access.path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/xml',
            'Accept': 'application/xml'
        },
        body: accessPayload
    };

    logger.debug('Sending access request: \n%s\n', JSON.stringify(options, null, 4));

    request(options, function processResponse(error, response, body) {
        if (error) {
            logger.error('[VALIDATION-GEN-001] Error connecting to Keystone Proxy: %d', error.message);
            callback(new errors.KeystoneProxyConnectionError(error));
        } else if (response.statusCode !== 200) {
            logger.error('[VALIDATION-GEN-002] Wrong status received by Keystone Proxy: %d', response.statusCode);
            logger.debug('Error body: \n%s\n\n', body);
            callback(new errors.KeystoneProxyValidationError('Wrong status code received: ' + response.statusCode));
        } else {
            parseResponse(body, function(error, decision) {
                if (error) {
                    callback(error);
                } else if (decision === 'Permit') {
                    logger.debug('Request access accepted');
                    callback(null);
                } else {
                    logger.debug('Request access denied');
                    callback(new errors.AccessDenied());
                }
            });
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
        apply(createAccessRequest, req.roles, req.organization, req.action),
        sendAccessRequest
    ], next);
}

/**
 *  Load the XML Templates for generating the validation requests. This method has to be called just once when the
 *  proxy has started, and the templates themselves are reused for every request.
 */
function loadTemplates(callback) {
    logger.debug('Loading access validation Templates');

    async.series([
        async.apply(fs.readFile, './lib/templates/validationRequest.xml', 'utf8'),
        async.apply(fs.readFile, './lib/templates/roleTemplate.xml', 'utf8')
    ], function templateLoaded(error, results) {
        if (error) {
            logger.fatal('[VALIDATION-FATAL-001] Validation Request templates not found');
            callback(errors.TemplateLoadingError(error));
        } else {
            requestTemplate = results[0];
            roleTemplate = results[1];
            callback();
        }
    });
}

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
        url: config.authentication.protocol + '://' + config.authentication.host + ':' + config.authentication.port +
            '/user',
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

exports.validate = validationProcess;
exports.extractRoles = extractRoles;
exports.init = loadTemplates;
