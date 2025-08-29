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
 * please contact with::[daniel.moranjimenez@telefonica.com]
 */

'use strict';

var serverMocks = require('../tools/serverMocks'),
    proxyLib = require('../../lib/fiware-pep-steelskin'),
    orionPlugin = require('../../lib/plugins/orionPlugin'),
    config = require('../../config'),
    async = require('async'),
    utils = require('../tools/utils'),
    request = require('../../lib/utils/requestWrapper'),
    originalAuthenticationModule;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

describe('HTTPS Options', function() {
    var proxy,
        mockTarget,
        mockTargetApp,
        mockAccess,
        mockAccessApp,
        mockOAuth,
        mockOAuthApp;

    beforeEach(function(done) {
        originalAuthenticationModule = config.authentication.module;
        config.authentication.module = 'idm';

        config.ssl.active = true;
        config.ssl.certFile = 'test/certs/pepTest.crt';
        config.ssl.keyFile = 'test/certs/pepTest.key';

        proxyLib.start(function(error, proxyObj) {
            proxy = proxyObj;

            proxy.middlewares.push(orionPlugin.extractCBAction);

            serverMocks.start(config.resource.original.port, function(error, server, app) {
                mockTarget = server;
                mockTargetApp = app;
                serverMocks.start(config.access.port, function(error, serverAccess, appAccess) {
                    mockAccess = serverAccess;
                    mockAccessApp = appAccess;
                    serverMocks.start(config.authentication.options.port, function(error, serverAuth, appAuth) {
                        mockOAuth = serverAuth;
                        mockOAuthApp = appAuth;

                        mockOAuthApp.handler = function(req, res) {
                            if (req.url.match(/\/v2.0\/token.*/)) {
                                res.status(200).json(
                                    utils.readExampleFile('./test/authorizationResponses/authorize.json'));
                            } else {
                                res.status(200).json(
                                    utils.readExampleFile('./test/authorizationResponses/rolesOfUser.json'));
                            }
                        };

                        async.series([
                            async.apply(serverMocks.mockPath, '/user', mockOAuthApp),
                            async.apply(serverMocks.mockPath, '/pdp/v3', mockAccessApp)
                        ], done);
                    });
                });
            });
        });
    });

    afterEach(function(done) {
        config.authentication.module = originalAuthenticationModule;

        config.ssl.active = false;
        proxyLib.stop(proxy, function(error) {
            serverMocks.stop(mockTarget, function() {
                serverMocks.stop(mockAccess, function() {
                    serverMocks.stop(mockOAuth, done);
                });
            });
        });
    });
    describe('When a request to the CB arrives to the proxy with HTTPS', function() {
        var options = {
            uri: 'https://localhost:' + config.resource.proxy.port + '/v2/op/update',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Fiware-Service': 'frn:contextbroker:admin_domain:::',
                'Fiware-ServicePath': 'admin_domain',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
            },
            json: utils.readExampleFile('./test/orionRequests/v2EntityCreation.json')
        };

        beforeEach(function(done) {
            async.series([
                async.apply(serverMocks.mockPath, '/validate', mockAccessApp),
                async.apply(serverMocks.mockPath, '/v2/op/update', mockTargetApp)
            ], done);
        });

        it('should proxy the request to the destination', function(done) {
            var mockExecuted = false;

            mockAccessApp.handler = function(req, res) {
                res.set('Content-Type', 'application/xml');
                res.send(utils.readExampleFile('./test/accessControlResponses/permitResponse.xml', true));
            };

            mockTargetApp.handler = function(req, res) {
                mockExecuted = true;
                res.status(200).json({});
            };

            request(options, function(error, response, body) {
                mockExecuted.should.equal(true);
                done();
            });
        });
    });
});
