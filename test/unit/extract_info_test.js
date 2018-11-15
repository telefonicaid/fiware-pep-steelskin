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
    config = require('../../config'),
    utils = require('../tools/utils'),
    async = require('async'),
    should = require('should'),
    request = require('request'),
    originalAuthenticationModule;


describe('Extract information from requests', function() {
    var proxy,
        mockServer,
        mockApp,
        mockAccess,
        mockAccessApp,
        mockOAuth,
        mockOAuthApp;

    beforeEach(function(done) {
        originalAuthenticationModule = config.authentication.module;
        config.authentication.module = 'idm';

        proxyLib.start(function(error, proxyObj) {
            proxy = proxyObj;

            serverMocks.start(config.resource.original.port, function(error, server, app) {
                mockServer = server;
                mockApp = app;
                serverMocks.start(config.access.port, function(error, serverAccess, appAccess) {
                    mockAccess = serverAccess;
                    mockAccessApp = appAccess;
                    mockAccessApp.handler = function(req, res) {
                        res.set('Content-Type', 'application/xml');
                        res.send(utils.readExampleFile('./test/accessControlResponses/permitResponse.xml', true));
                    };

                    serverMocks.start(config.authentication.options.port, function(error, serverAuth, appAuth) {
                        mockOAuth = serverAuth;
                        mockOAuthApp = appAuth;

                        mockOAuthApp.handler = function(req, res) {
                            res.status(200).json(
                                utils.readExampleFile('./test/authorizationResponses/rolesOfUser.json'));
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

        proxyLib.stop(proxy, function(error) {
            serverMocks.stop(mockServer, function() {
                serverMocks.stop(mockAccess, function() {
                    serverMocks.stop(mockOAuth, done);
                });
            });
        });
    });

    describe('When a request to the CB arrives to the proxy with all the information', function() {
        var options = {
            uri: 'http://localhost:' + config.resource.proxy.port + '/NGSI10/updateContext',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Fiware-Service': 'frn:contextbroker:admin_domain:::',
                'Fiware-ServicePath': 'admin_domain',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
            },
            json: utils.readExampleFile('./test/orionRequests/entityCreation.json')
        };

        beforeEach(function(done) {
            serverMocks.mockPath('/NGSI10/updateContext', mockApp, done);
        });

        it('should extract the organization to an attribute in the request', function(done) {
            var extractionExecuted = false;

            var testExtraction = function(req, res, callback) {
                should.exist(req.organization);
                req.organization.should.equal('frn:contextbroker:admin_domain:::');
                extractionExecuted = true;
                callback(null, req, res);
            };

            proxy.middlewares.push(testExtraction);

            request(options, function(error, response, body) {
                extractionExecuted.should.equal(true);
                done();
            });
        });

        it('should extract the user token to an attribute in the request', function(done) {
            var extractionExecuted = false;

            var testExtraction = function(req, res, callback) {
                should.exist(req.userId);
                req.userId.should.equal('UAidNA9uQJiIVYSCg0IQ8Q');
                extractionExecuted = true;
                callback(null, req, res);
            };

            proxy.middlewares.push(testExtraction);

            request(options, function(error, response, body) {
                extractionExecuted.should.equal(true);
                done();
            });
        });

        it('should proxy the request to the target URL', function(done) {
            var mockExecuted = false;

            mockApp.handler = function(req, res) {
                mockExecuted = true;
                res.status(200).json({});
            };

            request(options, function(error, response, body) {
                mockExecuted.should.equal(true);
                done();
            });
        });
    });

    describe('When a request arrives to the CB without a user token', function() {
        var options = {
            uri: 'http://localhost:' + config.resource.proxy.port + '/NGSI10/updateContext',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Fiware-Service': 'frn:contextbroker:admin_domain:::'
            },
            json: utils.readExampleFile('./test/orionRequests/entityCreation.json')
        };

        beforeEach(function(done) {
            serverMocks.mockPath('/NGSI10/updateContext', mockApp, done);
        });

        it('should reject the request with a 400 error code', function(done) {
            request(options, function(error, response, body) {
                response.statusCode.should.equal(400);
                done();
            });
        });

        it('should not proxy the request', function(done) {
            var mockExecuted = false;

            mockApp.handler = function(req, res) {
                mockExecuted = true;
                res.status(200).json({});
            };

            request(options, function(error, response, body) {
                mockExecuted.should.equal(false);
                done();
            });
        });
    });

    describe('When a request arrives to the CB without a Fiware Service header', function() {
        var options = {
            uri: 'http://localhost:' + config.resource.proxy.port + '/NGSI10/updateContext',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
            },
            json: utils.readExampleFile('./test/orionRequests/entityCreation.json')
        };

        beforeEach(function(done) {
            serverMocks.mockPath('/NGSI10/updateContext', mockApp, done);
        });

        it('should reject the request with a 400 error code', function(done) {
            request(options, function(error, response, body) {
                response.statusCode.should.equal(400);
                done();
            });
        });

        it('should not proxy the request', function(done) {
            var mockExecuted = false;

            mockApp.handler = function(req, res) {
                mockExecuted = true;
                res.status(200).json({});
            };

            request(options, function(error, response, body) {
                mockExecuted.should.equal(false);
                done();
            });
        });
    });
});
