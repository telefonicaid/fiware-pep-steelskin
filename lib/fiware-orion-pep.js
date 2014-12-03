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

var http = require('http'),
    https = require('https'),
    fs = require('fs'),
    express = require('express'),
    config = require('../config'),
    errors = require('./errors'),
    request = require('request'),
    validation = require('./services/validation'),
    authorization,
    async = require('async'),
    logger = require('fiware-node-logger'),
    domainMiddleware = require('./middleware/domain').requestDomain(),
    constants = require('./constants');

/**
 * Generic error handler for every request that raises an error in the validation process. TODO: change the error code
 * depending on the error type.
 *
 * @param {Object} error         Error that triggered the execution of the handler.
 * @param {Object} req           Incoming request.
 * @param {Object} res           Outgoing response.
 * @param {Function} next        Call to the next error handler in the chain.
 */
function handleError(error, req, res, next) {
    switch (error.name) {
        case 'SyntaxError':
            logger.debug('Wrong JSON Syntax on request: %s', error.body);
            res.json(400, {
                message: error.message
            });
            break;
        case 'KEYSTONE_PROXY_AUTHENTICATION_REJECTED':
            res.json(401, {
                message: error.message
            });
            break;
        case 'WRONG_XML_VALIDATION_RESPONSE':
        case 'KEYSTONE_PROXY_VALIDATION_ERROR':
        case 'KEYSTONE_PROXY_CONNECTION_ERROR':
            res.json(503, {
                message: error.message
            });
            break;
        default:
            res.json(403, {
                message: 'Access forbidden'
            });
    }
}

function setAuthenticationModule(moduleName) {
    authorization = require('./services/' + config.authentication.module + 'Auth');
}

/**
 * Middleware to extract the organization data from the request.
 *
 * @param {Object} req           Incoming request.
 * @param {Object} res           Outgoing response.
 * @param {Function} next        Call to the next middleware in the chain.
 */
function extractOrganization(req, res, next) {
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
 * Middleware to extract the user data (usually a token) from the request. TODO: extract the token from the URL if
 * there is no header.
 *
 * @param {Object} req           Incoming request.
 * @param {Object} res           Outgoing response.
 * @param {Function} next        Call to the next middleware in the chain.
 */
function extractUserId(req, res, next) {
    if (req.headers[constants.AUTHORIZATION_HEADER]) {
        req.userId = req.headers[constants.AUTHORIZATION_HEADER];
        next();
    } else {
        logger.error('[PROXY-GEN-002] User ID headers not found');
        next(new errors.UserNotFound());
    }
}

/**
 * Redirects the incoming request to the proxied host. The request is not read with a pipe, as it has been completely
 * read to guess its type.
 *
 * @param {Object} req           Incoming request.
 * @param {Object} res           Outgoing response.
 */
function sendRequest(req, res) {
    var options = {
        uri: 'http://' + config.resource.original.host + ':' + config.resource.original.port + req.path,
        method: req.method,
        headers: req.headers,
        body: JSON.stringify(req.body)
    };

    if (!options.headers[constants.X_FORWARDED_FOR_HEADER]) {
        options.headers[constants.X_FORWARDED_FOR_HEADER] = req.connection.remoteAddress;
    }

    delete options.headers['content-length'];
    options.headers.connection = 'close';
    request(options).pipe(res);
}

/**
 * Middleware that makes Express read the incoming body if the content-type is text/xml or application/xml (the default
 * behavior is to read the body if it can be parsed and leave it unread in any other case).
 *
 * @param {Object} req           Incoming request.
 * @param {Object} res           Outgoing response.
 * @param {Function} next        Invokes the next middleware in the chain.
 */
function xmlRawBody(req, res, next) {
    var contentType = req.headers['content-type'] || '',
        mime = contentType.split(';')[0];

    if (mime !== 'text/xml' && mime !== 'application/xml') {
        next();
    } else {
        var data = '';
        req.setEncoding('utf8');
        req.on('data', function(chunk) {
            data += chunk;
        });
        req.on('end', function() {
            req.rawBody = data;
            next();
        });
    }
}

function generateFRN(req, res, next) {
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

    if (req.entityType) {
        frn += req.entityType;
    } else {
        frn += ':';
    }

    req.frn = frn;

    next();
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

/**
 * Start a new proxy for the configured target. All the configuration is picked up from the config file.
 *
 * @param {Function} callback      When the proxy is created, this handler is called with an object containing: the
 *                                 http server the proxy is using; the proxy itself; and an array of middlewares that
 *                                 can be populated with code to be executed after all the standard code has been
 *                                 executed.
 */
function startProxy(callback) {
    var proxyObj = {
        server: null,
        proxy: express(),
        middlewares: []
    };

    logger.setLevel(config.logLevel);

    logger.getContext = function getDomainContext() {
        return require('domain').active;
    };

    logger.info('Creating proxy');

    /**
     * This function executes the current list of dynamic middlewares configured after the proxy has been started.
     */
    function executeDynamicMiddlewares(req, res, next) {
        var middlewareList = proxyObj.middlewares.slice(0);

        if (middlewareList.length > 0) {
            middlewareList[0] = async.apply(proxyObj.middlewares[0], req, res);
            async.waterfall(middlewareList, next);
        } else {
            next();
        }
    }

    setAuthenticationModule(config.authentication.module);

    proxyObj.proxy.set('port', config.resource.proxy.port);
    proxyObj.proxy.set('host', '0.0.0.0');
    proxyObj.proxy.use(express.json());
    proxyObj.proxy.use(xmlRawBody);
    proxyObj.proxy.use(express.urlencoded());
    proxyObj.proxy.use(domainMiddleware);
    proxyObj.proxy.use(extractOrganization);
    proxyObj.proxy.use(extractUserId);
    proxyObj.proxy.use(executeDynamicMiddlewares);
    proxyObj.proxy.use(generateFRN);
    proxyObj.proxy.use(authorization.process);
    proxyObj.proxy.use(checkBypass);
    proxyObj.proxy.use(validation.validate);
    proxyObj.proxy.use(sendRequest);
    proxyObj.proxy.use(handleError);


    if (config.ssl.active) {
        var sslOptions = {
            key: fs.readFileSync('./' + config.ssl.keyFile),
            cert: fs.readFileSync('./' + config.ssl.certFile)
        };

        proxyObj.server = https.createServer(sslOptions, proxyObj.proxy);
    } else {
        proxyObj.server = http.createServer(proxyObj.proxy);
    }

    proxyObj.server.listen(proxyObj.proxy.get('port'), proxyObj.proxy.get('host'), function startServer(error) {
        if (error) {
            logger.error('[PROXY-GEN-003] Error initializing proxy: ' + error.message);

            callback(error);
        } else {
            logger.info('Listening on port %d', config.resource.proxy.port);
            logger.info('Redirecting to host %s and port %d',
                config.resource.original.host, config.resource.original.port);

            validation.init(function initValidation(loadingError) {
                logger.info('Proxy started');
                callback(loadingError, proxyObj);
            });
        }
    });
}

/**
 * Stops the proxy passed as a parameter.
 *
 * @param {Object} proxy         The proxy object as it was returned in the creation callback (this is not the proxy
 *                               field of the returned object, but the whole object).
 */
function stopProxy(proxy, callback) {
    logger.info('Creating proxy');

    proxy.server.close();
    callback();
}

exports.start = startProxy;
exports.stop = stopProxy;
