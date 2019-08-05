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
    async = require('async'),
    apply = async.apply,
    config = require('../../config'),
    errors = require('../errors'),
    logger = require('logops'),
    constants = require('../constants'),
    mustache = require('mustache'),
    sax = require('sax'),
    fs = require('fs'),
    path = require('path'),
    cacheUtils = require('./cacheUtils'),
    authorization = require('./' + config.authentication.module + 'Auth'),
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

    logger.debug('Creating access request for roles [%j], with organization [%s] and action [%s]',
        roles, organization, action);

    for (var i = 0; i < roles.length; i++) {
        var roleParameters = {
            roleId: roles[i]
        };

        parameters.roles = parameters.roles + mustache.render(roleTemplate, roleParameters);
    }

    callback(null, mustache.render(requestTemplate, parameters));
}

/**
 * Parse the response received from the Access Control. This response is an XACML Response object, containing only a
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
 * Sends the validation request to the Access Control with the XML payload received.
 *
 * @param {String} accessPayload         XACML payload in string format.
 */
function sendAccessRequest(headers, accessPayload, callback) {
    var options = {
        uri: config.access.protocol + '://' + config.access.host + ':' + config.access.port + config.access.path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/xml',
            'Accept': 'application/xml',
            'fiware-service': headers['fiware-service']
        },
        body: accessPayload
    };

    if (headers[constants.ORGANIZATION_HEADER]) {
        options.headers[constants.ORGANIZATION_HEADER] = headers[constants.ORGANIZATION_HEADER];
    }

    if (headers[constants.PATH_HEADER]) {
        options.headers[constants.PATH_HEADER] = headers[constants.PATH_HEADER];
    }

    logger.debug('Sending access request: \n%j\n', options);

    request(options, function processResponse(error, response, body) {
        if (error) {
            logger.error('[VALIDATION-GEN-001] Error connecting to Access Control: %s', error.message);
            callback(new errors.AccessControlConnectionError(error));
        } else if (response.statusCode !== 200) {
            logger.error('[VALIDATION-GEN-002] Wrong status received by Access Control: %d', response.statusCode);
            logger.debug('Error body: \n%s\n\n', body);
            callback(new errors.AccessControlValidationError('Wrong status code received: ' + response.statusCode));
        } else {
            parseResponse(body, callback);
        }
    });
}

function validationRequest(roles, frn, action, headers, callback) {
    var cacheKey = frn + '#' + action + '#';
    if (roles && roles.length > 0) {
        cacheKey += roles.join('-');
    }

    function processValue(cachedValue, innerCallback) {
        innerCallback(null, cachedValue);
    }

    function retrieveRequest(innerCallback) {
        async.waterfall([
            apply(createAccessRequest, roles, frn, action),
            apply(sendAccessRequest, headers)
        ], function(error, decision) {
            cacheUtils.get().updating.validation[cacheKey] = false;

            if (error) {
                innerCallback(error);
            } else {
                var finalDecision = decision || 'Invalid';
                logger.debug('cache %s set to %s', cacheKey, finalDecision);
                cacheUtils.get().data.validation.set(cacheKey, finalDecision);
                innerCallback(null, finalDecision);
            }
        });
    }

    cacheUtils.cacheAndHold('validation', cacheKey, retrieveRequest, processValue, callback);
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
    function handleValidation(error, value) {
        if (error) {
            next(error);
        } else if (value === 'Permit') {
            logger.debug('Request access accepted');
            next(null, 'Permit');
        } else {
            logger.debug('Request access denied');
            next(new errors.AccessDenied());
        }
    }

    if (req.bypass) {
        next();
    } else if (req.roles && req.roles.length === 0) {
        logger.debug('Roles not found for subservice %s', req.subService);

        // TODO: check configuration to know if should evaluate all possible subservices
        if (config.access.multiLevel) {
            // Search again roles in subservice
            var subservice = req.headers['fiware-servicepath'];
            // Get new subservice from current subservice
            var level = subservice.split('/').length - 1;
            var permit = false;
            var requestValidated = false;
            if (level > 1) {
                var newSubservice = subservice;
                var i = 1;
                while ((i < level) && (!permit)) {
                    newSubservice = newSubservice.substring(0, newSubservice.lastIndexOf('/'));
                    logger.debug('Trying with subservice %s', newSubservice);
                    req.subService = newSubservice;
                    req.frn.replace(subservice, newSubservice);
                    req.headers['fiware-servicepath'] = newSubservice;
                    // Get new user token for that new subservice &
                    // Get new roles in that new subservice
                    /* jshint loopfunc: true */
                    authorization.process(req, res, function(error, result) {
                        if (!error) {
                            // Validate it
                            validationRequest(req.roles, req.frn, req.action,
                                              req.headers, function(error, value) {
                                                  if (error) {
                                                      logger.debug('error: trying next');
                                                      /* jshint loopfunc: true */
                                                      requestValidated = true;
                                                  } else if (value === 'Permit') {
                                                      logger.debug('Request access accepted in bucle');
                                                      /* jshint loopfunc: true */
                                                      permit = true;
                                                      requestValidated = true;
                                                      next(null, 'Permit');
                                                  } else {
                                                      /* jshint loopfunc: true */
                                                      requestValidated = true;
                                                      logger.debug('Request access denied: trying next');
                                                  }
                                              }); // validationRequest
                            function checkValidationRequest() {
                                if (!requestValidated) {
                                    logger.debug('waiting for validationRequest');
                                    window.setTimeout(checkValidationRequest, 100);
                                } else {
                                    logger.debug('end of wait for validationRequest');
                                }
                            }
                            checkValidationRequest();
                        } else {
                            logger.debug('error authorization process in subservice %s',
                                         newSubservice);
                        }
                    }); // authorization.process
                    i++;
                } // while
                if (!permit) {
                    logger.debug('not permit');
                    req.subService = subservice;
                    next(new errors.RolesNotFound(req.subService));
                } else {
                    logger.debug('permit');
                }
            } else { // if (level > 1)
                logger.debug('roles not found out of bucle');
                next(new errors.RolesNotFound(req.subService));
            }
        } else { 
            next(new errors.RolesNotFound(req.subService));
        } // End check configuration
    } else {
        validationRequest(req.roles, req.frn, req.action, req.headers, handleValidation);
    }
}

/**
 *  Load the XML Templates for generating the validation requests. This method has to be called just once when the
 *  proxy has started, and the templates themselves are reused for every request.
 */
function loadTemplates(callback) {
    logger.debug('Loading access validation Templates');

    async.series([
        async.apply(fs.readFile, path.join(__dirname, '../templates/validationRequest.xml'), 'utf8'),
        async.apply(fs.readFile, path.join(__dirname, '../templates/roleTemplate.xml'), 'utf8')
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

/**
 * Checks if an admin bypass is requested, and if the user has the admin role.
 *
 * @param {Object} req           Incoming request.
 * @param {Object} res           Outgoing response.
 * @param {Function} next        Invokes the next middleware in the chain.
 */
function checkBypass(req, res, next) {
    if (config.bypass && config.bypassRoleId && req.roles) {
        for (var i = 0; i < req.roles.length; i++) {
            if (req.roles[i] === config.bypassRoleId) {
                req.bypass = true;
            }
        }
    }

    next();
}

exports.validate = validationProcess;
exports.init = loadTemplates;
exports.checkBypass = checkBypass;
