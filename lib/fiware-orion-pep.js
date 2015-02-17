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
    adminMiddleware = require('./middleware/administration'),
    validation = require('./services/validation'),
    proxyMiddleware = require('./middleware/proxy'),
    authorization,
    async = require('async'),
    logger = require('logops'),
    domainMiddleware = require('./middleware/domain').requestDomain();

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
    var code;

    switch (error.name) {
        case 'SyntaxError':
            logger.debug('Wrong JSON Syntax on request: %s', error.body);
            code = 400;
            break;
        case 'KEYSTONE_AUTHENTICATION_REJECTED':
            code = 401;
            break;
        case 'TARGET_SERVER_ERROR':
            code = 501;
            break;
        case 'WRONG_XML_VALIDATION_RESPONSE':
        case 'KEYSTONE_VALIDATION_ERROR':
        case 'KEYSTONE_CONNECTION_ERROR':
            code = 503;
            break;
        default:
            code = 403;
    }

    res.json(code, {
        message: error.message
    });
}

function setAuthenticationModule(moduleName) {
    authorization = require('./services/' + config.authentication.module + 'Auth');
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
    if (!req.is('*/xml')) {
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

/**
 * This function creates a middleware that executes the current list of dynamic middlewares configured after the proxy
 * has been started.
 *
 * @return {Function}           Express middleware that executes the dynamic middlewares.
 */
function createDynamicMiddlewareExecutor(proxyObj) {
    return function dynamicMiddlewareExecutor(req, res, next) {
        var middlewareList = proxyObj.middlewares.slice(0);

        if (middlewareList.length > 0) {
            middlewareList[0] = async.apply(proxyObj.middlewares[0], req, res);
            async.waterfall(middlewareList, next);
        } else {
            next();
        }
    };
}

/**
 * Initializes the proxy server. It fills the proxyObj with information about the started proxy and passes it along.
 *
 * @param {Object} proxyObj         Running data of the whole proxy application.
 */
function initializeProxy(proxyObj, callback) {
    proxyObj.proxy = express();

    proxyObj.proxy.set('port', config.resource.proxy.port);
    proxyObj.proxy.set('host', '0.0.0.0');
    proxyObj.proxy.use(express.json());
    proxyObj.proxy.use(xmlRawBody);
    proxyObj.proxy.use(express.urlencoded());
    proxyObj.proxy.use(domainMiddleware);
    proxyObj.proxy.use(proxyMiddleware.extractOrganization);
    proxyObj.proxy.use(proxyMiddleware.extractUserId);
    proxyObj.proxy.use(createDynamicMiddlewareExecutor(proxyObj));
    proxyObj.proxy.use(proxyMiddleware.generateFRN);
    proxyObj.proxy.use(authorization.process);
    proxyObj.proxy.use(validation.checkBypass);
    proxyObj.proxy.use(validation.validate);
    proxyObj.proxy.use(proxyMiddleware.sendRequest);
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
            logger.info('Proxy listening on port %d', config.resource.proxy.port);
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
 * Initializes the administration server. It fills the proxyObj with information about the started proxy and passes
 * it along.
 *
 * @param {Object} proxyObj         Running data of the whole proxy application.
 */
function initializeAdmin(proxyObj, callback) {
    proxyObj.administration = express();

    proxyObj.administration.set('port', config.resource.proxy.adminPort);
    proxyObj.administration.set('host', '0.0.0.0');
    proxyObj.administration.use(express.json());
    proxyObj.administration.use(express.urlencoded());
    proxyObj.administration.use(domainMiddleware);
    proxyObj.administration.use(handleError);

    proxyObj.administration.use(proxyObj.administration.router);
    adminMiddleware.loadContextRoutes(proxyObj.administration);

    if (config.ssl.active) {
        var sslOptions = {
            key: fs.readFileSync('./' + config.ssl.keyFile),
            cert: fs.readFileSync('./' + config.ssl.certFile)
        };

        proxyObj.adminServer = https.createServer(sslOptions, proxyObj.administration);
    } else {
        proxyObj.adminServer = http.createServer(proxyObj.administration);
    }

    proxyObj.adminServer.listen(
        proxyObj.administration.get('port'),
        proxyObj.administration.get('host'), function startServer(error) {

        if (error) {
            logger.error('[PROXY-GEN-003] Error initializing administration server: ' + error.message);

            callback(error);
        } else {
            logger.info('Administration service listening on port %d', config.resource.proxy.adminPort);

            validation.init(function initValidation(loadingError) {
                logger.info('Administration service started');
                callback(loadingError, proxyObj);
            });
        }
    });
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
        adminServer: null,
        middlewares: []
    };

    logger.setLevel(config.logLevel);

    logger.getContext = function getDomainContext() {
        return require('domain').active;
    };

    logger.info('Creating proxy');

    setAuthenticationModule(config.authentication.module);

    async.waterfall([
        async.apply(initializeProxy, proxyObj),
        initializeAdmin
    ], callback);
}

/**
 * Stops the proxy passed as a parameter.
 *
 * @param {Object} proxy         The proxy object as it was returned in the creation callback (this is not the proxy
 *                               field of the returned object, but the whole object).
 */
function stopProxy(proxy, callback) {
    logger.info('Creating proxy');

    proxy.server.close(function() {
        proxy.adminServer.close(callback);
    });
}

exports.start = startProxy;
exports.stop = stopProxy;
