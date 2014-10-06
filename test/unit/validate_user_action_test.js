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

var serverMocks = require('../tools/serverMocks'),
    proxyLib = require('../../lib/fiware-orion-pep'),
    orionPlugin = require('../../lib/services/orionPlugin'),
    async = require('async'),
    apply = async.apply,
    config = require('../../config'),
    utils = require('../tools/utils'),
    should = require('should'),
    request = require('request');

function authMiddleware(authPath, authFile, rolesFile, headers) {
    return function(req, res) {
        if (req.path == authPath) {
            for (var i=0; i < headers.length; i++) {
                req.headers[headers[i].name] = headers[i].value;
            }
            res.json(200, utils.readExampleFile(authFile));
        } else {
            res.json(200, utils.readExampleFile(rolesFile));
        }
    };
}

describe.only('Validate action with Access Control', function() {
    var proxy,
        mockTarget,
        mockTargetApp,
        mockAccess,
        mockAccessApp,
        mockOAuth,
        mockOAuthApp,
        authenticationMechanisms = [
            {
                module: 'idm',
                path: '/validate',
                authPath: '/user',
                rolesFile: './test/authorizationResponses/rolesOfUser.json',
                authenticationResponse: './test/authorizationResponses/authorize.json',
                headers: [
                ]
            },
            {
                module: 'keystone',
                path: '/validate',
                authPath: '/v3/auth/tokens',
                rolesFile: './test/keystoneResponses/rolesOfUser.json',
                authenticationResponse: './test/keystoneResponses/authorize.json',
                headers: [
                    {
                        name: 'X-Subject-Token',
                        value: '152Rkj+LtYmzv-eXuyKcToxtEnPph'
                    }
                ]
            }
        ];

    function initializeUseCase(currentAuthentication, done) {
        config.authentication.module = currentAuthentication.module;

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

                        mockOAuthApp.handler = authMiddleware(
                            currentAuthentication.authPath,
                            currentAuthentication.authenticationResponse,
                            currentAuthentication.rolesFile);

                        mockAccessApp.handler = function(req, res) {
                            res.set('Content-Type', 'application/xml');
                            res.send(utils.readExampleFile('./test/accessControlResponses/permitResponse.xml', true));
                        };

                        done();
                    });
                });
            });
        });
    }

    for (var q=0; q < authenticationMechanisms.length; q++) {
        describe('[' + authenticationMechanisms[q].module +
            '] When a request to the CB arrives to the proxy with appropriate permissions', function() {
            var options = {
                    uri: 'http://localhost:' + config.resource.proxy.port + '/NGSI10/updateContext',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Fiware-Service': '551',
                        'fiware-servicepath': '833',
                        'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
                    },
                    json: utils.readExampleFile('./test/orionRequests/entityCreation.json')
                },
                currentAuthentication = authenticationMechanisms[q];


            beforeEach(function(done) {
                initializeUseCase(currentAuthentication, function () {
                    async.series([
                        async.apply(serverMocks.mockPath, '/user', mockOAuthApp),
                        async.apply(serverMocks.mockPath, currentAuthentication.path, mockAccessApp),
                        async.apply(serverMocks.mockPath, '/NGSI10/updateContext', mockTargetApp)
                    ], done);
                });
            });

            afterEach(function(done) {
                proxyLib.stop(proxy, function(error) {
                    serverMocks.stop(mockTarget, function() {
                        serverMocks.stop(mockAccess, function() {
                            serverMocks.stop(mockOAuth, done);
                        });
                    });
                });
            });

            it('should retrieve the roles from the IDM', function(done) {
                /*jshint camelcase: false*/
                var mockExecuted = false;

                mockOAuthApp.handler = function(req, res) {
                    should.exist(req.query.access_token);
                    req.query.access_token.should.equal('UAidNA9uQJiIVYSCg0IQ8Q');
                    res.json(200, utils.readExampleFile(currentAuthentication.rolesFile));
                    mockExecuted = true;
                };

                request(options, function(error, response, body) {
                    mockExecuted.should.equal(true);
                    done();
                });
            });

            it('should proxy the request to the destination', function(done) {
                var mockExecuted = false;

                mockAccessApp.handler = function(req, res) {
                    res.set('Content-Type', 'application/xml');
                    res.send(utils.readExampleFile('./test/accessControlResponses/permitResponse.xml', true));
                };

                mockTargetApp.handler = function(req, res) {
                    mockExecuted = true;
                    res.json(200, {});
                };

                request(options, function(error, response, body) {
                    mockExecuted.should.equal(true);
                    done();
                });
            });
        });

        describe('[' + authenticationMechanisms[q].module +
            '] When a request to the CB arrives for a user with wrong permissions', function() {
            var options = {
                    uri: 'http://localhost:' + config.resource.proxy.port + '/NGSI10/updateContext',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Fiware-Service': '551',
                        'fiware-servicepath': '833',
                        'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
                    },
                    json: utils.readExampleFile('./test/orionRequests/entityCreation.json')
                },
                currentAuthentication = authenticationMechanisms[q];

            beforeEach(function(done) {
                initializeUseCase(currentAuthentication, function () {
                    async.series([
                        async.apply(serverMocks.mockPath, '/user', mockOAuthApp),
                        async.apply(serverMocks.mockPath, currentAuthentication.path, mockAccessApp),
                        async.apply(serverMocks.mockPath, '/NGSI10/updateContext', mockTargetApp)
                    ], done);
                });

            });

            afterEach(function(done) {
                proxyLib.stop(proxy, function(error) {
                    serverMocks.stop(mockTarget, function() {
                        serverMocks.stop(mockAccess, function() {
                            serverMocks.stop(mockOAuth, done);
                        });
                    });
                });
            });

            it('should reject the request with a 403 error code', function(done) {
                var mockExecuted = false;

                mockAccessApp.handler = function(req, res) {
                    res.set('Content-Type', 'application/xml');
                    res.status(200).send(utils.readExampleFile('./test/accessControlResponses/denyResponse.xml', true));
                };

                mockTargetApp.handler = function(req, res) {
                    mockExecuted = true;
                    res.json(200, {});
                };

                request(options, function(error, response, body) {
                    mockExecuted.should.equal(false);
                    response.statusCode.should.equal(403);
                    done();
                });
            });
        });

        describe('[' + authenticationMechanisms[q].module +
            '] When a request to the CB arrives and the connection to the Access Control is not working', function() {
            var options = {
                    uri: 'http://localhost:' + config.resource.proxy.port + '/NGSI10/updateContext',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Fiware-Service': '551',
                        'Fiware-Path': '833',
                        'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
                    },
                    json: utils.readExampleFile('./test/orionRequests/entityCreation.json')
                },
                currentAuthentication = authenticationMechanisms[q];

            beforeEach(function(done) {
                initializeUseCase(currentAuthentication, function () {
                    serverMocks.stop(mockAccess, function() {
                        async.series([
                            async.apply(serverMocks.mockPath, '/NGSI10/updateContext', mockTargetApp)
                        ], done);
                    });
                });
            });

            afterEach(function(done) {
                proxyLib.stop(proxy, function(error) {
                    serverMocks.stop(mockTarget, function() {
                        serverMocks.stop(mockOAuth, done);
                    });
                });
            });

            it('should reject the request with a 503 error', function(done) {
                var mockExecuted = false;

                mockAccessApp.handler = function(req, res) {
                    mockExecuted = true;
                    res.json(500, {});
                };

                request(options, function(error, response, body) {
                    response.statusCode.should.equal(503);
                    done();
                });
            });
        });


        describe('[' + authenticationMechanisms[q].module + '] ' +
            'When a request to the CB arrives and the Access Control fails to make a proper decision', function() {
            var options = {
                    uri: 'http://localhost:' + config.resource.proxy.port + '/NGSI10/updateContext',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Fiware-Service': '551',
                        'Fiware-Path': '833',
                        'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
                    },
                    json: utils.readExampleFile('./test/orionRequests/entityCreation.json')
                },
                currentAuthentication = authenticationMechanisms[q];

            beforeEach(function(done) {
                initializeUseCase(currentAuthentication, function () {
                    async.series([
                        async.apply(serverMocks.mockPath, currentAuthentication.path, mockAccessApp),
                        async.apply(serverMocks.mockPath, '/NGSI10/updateContext', mockTargetApp)
                    ], done);
                });
            });

            afterEach(function(done) {
                proxyLib.stop(proxy, function(error) {
                    serverMocks.stop(mockTarget, function() {
                        serverMocks.stop(mockAccess, function() {
                            serverMocks.stop(mockOAuth, done);
                        });
                    });
                });
            });

            it('should reject the request with a 503 error', function(done) {
                var mockExecuted = false;

                mockAccessApp.handler = function(req, res) {
                    mockExecuted = true;
                    res.json(500, {});
                };

                request(options, function(error, response, body) {
                    response.statusCode.should.equal(503);
                    done();
                });
            });
        });

        describe('[' + authenticationMechanisms[q].module + '] ' +
            'When a request arrives and the authentication token has expired', function() {
            it('should reject the request with a 503 temporary unavailable message');
        });
    }
});
