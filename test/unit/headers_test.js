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
    should = require('should'),
    request = require('request'),
    originalAuthenticationModule;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

describe('Control header behavior', function() {
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
                            res.status(200).json(
                                utils.readExampleFile('./test/authorizationResponses/rolesOfUser.json'));
                        };

                        async.series([
                            async.apply(serverMocks.mockPath, '/user', mockOAuthApp),
                            async.apply(serverMocks.mockPath, '/v2.0/tokens', mockOAuthApp),
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
            serverMocks.stop(mockTarget, function() {
                serverMocks.stop(mockAccess, function() {
                    serverMocks.stop(mockOAuth, done);
                });
            });
        });
    });

    describe('When a request to the CB arrives to the proxy without X-Forwarded-For', function() {
        var options = {
            uri: 'http://127.0.0.1:' + config.resource.proxy.port + '/v2/op/update',
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
                async.apply(serverMocks.mockPath, '/pdp/v3', mockAccessApp),
                async.apply(serverMocks.mockPath, '/v2/op/update', mockTargetApp)
            ], done);
        });

        it('should add the X-Forwarded-For header', function(done) {
            var mockExecuted = false;

            mockAccessApp.handler = function(req, res) {
                res.set('Content-Type', 'application/xml');
                res.send(utils.readExampleFile('./test/accessControlResponses/permitResponse.xml', true));
            };

            mockTargetApp.handler = function(req, res) {
                mockExecuted = true;
                should.exist(req.headers['x-forwarded-for']);
                req.headers['x-forwarded-for'].should.equal('127.0.0.1');

                res.status(200).json({});
            };

            request(options, function(error, response, body) {
                mockExecuted.should.equal(true);
                done();
            });
        });
    });

    describe('When a request to the CB arrives to the proxy with the X-Forwarded-For header', function() {
        var options = {
            uri: 'http://127.0.0.1:' + config.resource.proxy.port + '/v2/op/update',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Fiware-Service': 'frn:contextbroker:admin_domain:::',
                'Fiware-ServicePath': 'admin_domain',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q',
                'X-Forwarded-For': '192.168.2.1'
            },
            json: utils.readExampleFile('./test/orionRequests/v2EntityCreation.json')
        };

        beforeEach(function(done) {
            async.series([
                async.apply(serverMocks.mockPath, '/pdp/v3', mockAccessApp),
                async.apply(serverMocks.mockPath, '/v2/op/update', mockTargetApp)
            ], done);
        });

        it('should reuse the X-Forwarded-For header', function(done) {
            var mockExecuted = false;

            mockAccessApp.handler = function(req, res) {
                res.set('Content-Type', 'application/xml');
                res.send(utils.readExampleFile('./test/accessControlResponses/permitResponse.xml', true));
            };

            mockTargetApp.handler = function(req, res) {
                mockExecuted = true;
                should.exist(req.headers['x-forwarded-for']);
                req.headers['x-forwarded-for'].should.equal('192.168.2.1');

                res.status(200).json({});
            };

            request(options, function(error, response, body) {
                mockExecuted.should.equal(true);
                done();
            });
        });
    });

    describe('When a request to the CB arrives to the proxy with a json body', function() {
        var options = {
            uri: 'http://127.0.0.1:' + config.resource.proxy.port + '/v2/op/update',
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Fiware-Service': 'frn:contextbroker:admin_domain:::',
                'Fiware-ServicePath': 'admin_domain',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q',
                'X-Forwarded-For': '192.168.2.1'
            },
            body: JSON.stringify(utils.readExampleFile('./test/orionRequests/v2EntityCreation.json'))
        };
        beforeEach(function(done) {
            async.series([
                async.apply(serverMocks.mockPath, '/pdp/v3', mockAccessApp),
                async.apply(serverMocks.mockPath, '/v2/op/update', mockTargetApp)
            ], done);
        });

        it('should manage content-type: application/json header', function(done) {
            var mockExecuted = false,
                expectedBody,
                expectedLength;

            options.headers['Content-Type'] = 'application/json';

            mockAccessApp.handler = function(req, res) {
                res.set('Content-Type', 'application/xml');
                res.send(utils.readExampleFile('./test/accessControlResponses/permitResponse.xml', true));
            };

            mockTargetApp.handler = function(req, res) {
                mockExecuted = true;
                expectedBody = req.body;
                expectedLength = req.headers['content-length'];

                res.status(200).json({});
            };

            request(options, function(error, response, body) {
                mockExecuted.should.equal(true);
                should.exist(expectedBody);
                expectedLength.should.be.above(0);
                done();
            });
        });

        it('should manage content-type header with charset', function(done) {
            var mockExecuted = false,
                expectedBody,
                expectedLength;

            options.headers['Content-Type'] = 'application/json; charset=utf-8';

            mockAccessApp.handler = function(req, res) {
                res.set('Content-Type', 'application/xml');
                res.send(utils.readExampleFile('./test/accessControlResponses/permitResponse.xml', true));
            };

            mockTargetApp.handler = function(req, res) {
                mockExecuted = true;
                expectedBody = req.body;
                expectedLength = req.headers['content-length'];

                res.status(200).json({});
            };

            request(options, function(error, response, body) {
                mockExecuted.should.equal(true);
                should.exist(expectedBody);
                expectedLength.should.be.above(0);
                done();
            });
        });
    });

    describe('When a request to the CB arrives to the proxy with a json content header but wrong body', function() {
        var options = {
            uri: 'http://127.0.0.1:' + config.resource.proxy.port + '/v2/op/update',
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Fiware-Service': 'frn:contextbroker:admin_domain:::',
                'Fiware-ServicePath': 'admin_domain',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q',
                'X-Forwarded-For': '192.168.2.1'
            },
            body: '<xml>   >'
        };
        beforeEach(function(done) {
            async.series([
                async.apply(serverMocks.mockPath, '/pdp/v3', mockAccessApp),
                async.apply(serverMocks.mockPath, '/v2/op/update', mockTargetApp)
            ], done);
        });

        it('should return a 400 WRONG_JSON_PAYLOAD error', function(done) {
            var mockExecuted = false,
                expectedBody,
                expectedLength;

            options.headers['Content-Type'] = 'application/json';

            mockAccessApp.handler = function(req, res) {
                res.set('Content-Type', 'application/xml');
                res.send(utils.readExampleFile('./test/accessControlResponses/permitResponse.xml', true));
            };

            mockTargetApp.handler = function(req, res) {
                mockExecuted = true;
                expectedBody = req.body;
                expectedLength = req.headers['content-length'];

                res.status(200).json({});
            };

            request(options, function(error, response, body) {
                var parsedBody = JSON.parse(body);
                response.statusCode.should.equal(400);
                should.exist(parsedBody.name);
                parsedBody.name.should.equal('WRONG_JSON_PAYLOAD');
                done();
            });
        });
    });

    describe('When the PEP Proxy sends a request to the access control', function() {
        var options = {
            uri: 'http://127.0.0.1:' + config.resource.proxy.port + '/v2/op/update',
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
                async.apply(serverMocks.mockPath, '/pdp/v3', mockAccessApp),
                async.apply(serverMocks.mockPath, '/v2/op/update', mockTargetApp)
            ], done);
        });

        it('should forward the fiware-service header', function(done) {
            var mockExecuted = false;

            mockAccessApp.handler = function(req, res) {
                should.exist(req.headers['fiware-service']);
                req.headers['fiware-service'].should.equal('frn:contextbroker:admin_domain:::');

                res.set('Content-Type', 'application/xml');
                res.send(utils.readExampleFile('./test/accessControlResponses/permitResponse.xml', true));
                mockExecuted = true;
            };

            mockTargetApp.handler = function(req, res) {
                res.status(200).json({});
            };

            request(options, function(error, response, body) {
                mockExecuted.should.equal(true);
                done();
            });
        });
    });

    function checkUnexistentHeader(headerTest) {
        describe('When a request to the CB arrives to the proxy without "' + headerTest + '" header', function() {
            var options;

            beforeEach(function(done) {
                options = {
                    uri: 'http://127.0.0.1:' + config.resource.proxy.port + '/v2/op/update',
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                        'accept': 'application/json',
                        'fiware-service': 'frn:contextbroker:admin_domain:::',
                        'fiware-servicepath': 'admin_domain',
                        'x-auth-token': 'UAidNA9uQJiIVYSCg0IQ8Q'
                    },
                    json: utils.readExampleFile('./test/orionRequests/v2EntityCreation.json')
                };

                delete options.headers[headerTest];
                async.series([
                    async.apply(serverMocks.mockPath, '/pdp/v3', mockAccessApp),
                    async.apply(serverMocks.mockPath, '/v2/op/update', mockTargetApp)
                ], done);
            });

            it('should return a 400 error indicating the missing header', function(done) {
                request(options, function(error, response, body) {
                    response.statusCode.should.equal(400);
                    should.exist(body);
                    body.message.should.match(new RegExp('.*' + headerTest + '.*'));
                    done();
                });
            });
        });
    }

    function checkEmptyHeader(headerTest) {
        describe('When a request arrives to the proxy with an empty "' + headerTest + '" header', function() {
            var options;

            beforeEach(function(done) {
                options = {
                    uri: 'http://127.0.0.1:' + config.resource.proxy.port + '/v2/op/update',
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                        'accept': 'application/json',
                        'fiware-service': 'frn:contextbroker:admin_domain:::',
                        'fiware-servicepath': 'admin_domain',
                        'x-auth-token': 'UAidNA9uQJiIVYSCg0IQ8Q'
                    },
                    json: utils.readExampleFile('./test/orionRequests/v2EntityCreation.json')
                };

                options.headers[headerTest] = '';
                async.series([
                    async.apply(serverMocks.mockPath, '/pdp/v3', mockAccessApp),
                    async.apply(serverMocks.mockPath, '/v2/op/update', mockTargetApp)
                ], done);
            });

            it('should return a 400 error indicating the empty header', function(done) {
                request(options, function(error, response, body) {
                    response.statusCode.should.equal(400);
                    should.exist(body);
                    body.message.should.match(new RegExp('.*' + headerTest + '.*'));
                    done();
                });
            });
        });
    }

    var mandatoryHeaders = [
        'fiware-service',
        'fiware-servicepath',
        'x-auth-token'
    ];

    for (var i = 0; i < mandatoryHeaders.length; i++) {
        checkEmptyHeader(mandatoryHeaders[i]);
        checkUnexistentHeader(mandatoryHeaders[i]);
    }
});
