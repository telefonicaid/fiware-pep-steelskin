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

var http = require('http'),
    express = require('express'),
    config = require('../config'),
    errors = require('../errors'),
    request = require('request'),
    async = require('async');

/**
 * Generic error handler for every request that raises an error in the validation process. TODO: change the error code
 * depending on the error type.
 *
 * @param req           Incoming request.
 * @param res           Outgoing response.
 */
function handleError(req, res) {
    res.json(403, {
        message: 'Access forbidden'
    });
}

/**
 * Middleware to extract the organization data from the request.
 *
 * @param req           Incoming request.
 * @param res           Outgoing response.
 */
function extractOrganization(req, res, callback) {
    if (req.headers['fiware-service']) {
        req.organization = req.headers['fiware-service'];
        callback(null, req, res);
    } else {
        callback(new Error(errors.ORGANIZATION_NOT_FOUND));
    }
}

/**
 * Middleware to extract the user data (usually a token) from the request. TODO: extract the token from the URL if
 * there is no header.
 *
 * @param req           Incoming request.
 * @param res           Outgoing response.
 */
function extractUserId(req, res, callback) {
    if (req.headers['x-auth-token']) {
        req.userId = req.headers['x-auth-token'];
        callback(null, req, res);
    } else {
        callback(new Error(errors.USER_NOT_FOUND));
    }
}

function sendRequest(req, res) {
    var options = {
        uri: 'http://' + config.resource.original.host + ':' + config.resource.original.port + req.path,
        method: req.method,
        headers: req.headers,
        body: JSON.stringify(req.body)
    };

    request(options).pipe(res);
}

/**
 * Start a new proxy for the configured target. All the configuration is picked up from the config file.
 *
 * @param callback      When the proxy is created, this handler is called with an object containing: the http server
 *                      the proxy is using; the proxy itself; and an array of middlewares that can be populated with
 *                      code to be executed after all the standard code has been executed.
 */
function startProxy(callback) {
    var proxyObj = {
        server: null,
        proxy: express(),
        middlewares: []
    };

    function proxyFunction(originalReq, originalRes) {
        var middlewareList = [
            async.apply(extractOrganization, originalReq, originalRes),
            extractUserId
        ];

        middlewareList = middlewareList.concat(proxyObj.middlewares);

        async.waterfall(middlewareList, function (error, req, res) {
            if (error) {
                handleError(originalReq, originalRes);
            } else {
                sendRequest(req, res);
            }
        });
    }

    proxyObj.proxy.set('port', config.resource.proxy.port);
    proxyObj.proxy.set('host', '0.0.0.0');
    proxyObj.proxy.use(express.json());
    proxyObj.proxy.use(express.urlencoded());
    proxyObj.proxy.use(proxyFunction);

    proxyObj.server = http.createServer(proxyObj.proxy);

    proxyObj.server.listen(proxyObj.proxy.get('port'), proxyObj.proxy.get('host'), function (error) {
        callback(error, proxyObj);
    });
}

/**
 * Stops the proxy passed as a parameter.
 *
 * @param proxy         The proxy object as it was returned in the creation callback (this is not the proxy field of
 *                      the returned object, but the whole object).
 */
function stopProxy(proxy, callback) {
    proxy.server.close();
    callback();
}

exports.start = startProxy;
exports.stop = stopProxy;