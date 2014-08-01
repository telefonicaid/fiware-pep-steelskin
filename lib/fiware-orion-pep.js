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
    httpProxy = require('http-proxy'),
    config = require('../config'),
    errors = require('../errors'),
    async = require('async');

function handleError(req, res) {
    res.writeHead(403, {
        'Content-Type': 'text/plain'
    });
    res.write(JSON.stringify({
        message: 'Access forbidden'
    }));
    res.end();
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

function startProxy(callback) {
    var proxyObj = {
            server: null,
            proxy: httpProxy.createProxyServer({
                target: config.resource.original
            }),
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
                proxyObj.proxy.web(req, res);
            }
        });
    }

    proxyObj.server = http.createServer(proxyFunction).listen(config.resource.proxy.port);

    callback(null, proxyObj);
}

function stopProxy(proxy, callback) {
    proxy.server.close();
    callback();
}

exports.start = startProxy;
exports.stop = stopProxy;