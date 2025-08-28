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
    cacheUtils = require('../../lib/services/cacheUtils'),
    async = require('async'),
    config = require('../../config'),
    utils = require('../tools/utils'),
    request = require('request');

describe('Unvalidated mode', function() {
    /* jshint loopfunc: true */

    var proxy,
        mockTarget,
        mockTargetApp,
        mockAccess,
        mockAccessApp,
        mockOAuth,
        mockOAuthApp,
        authenticationMechanism = {
                module: 'keystone',
                path: '/v3/role_assignments',
                authPath: '/v3/auth/tokens',
                rolesFile: './test/keystoneResponses/rolesOfUser.json',
                authenticationResponse: './test/keystoneResponses/authorize.json',
                headers: [
                ],
                authMock: serverMocks.mockKeystone
            };

    function initializeUseCase(currentAuthentication, done) {
        config.authentication.module = currentAuthentication.module;
        config.authentication.path = currentAuthentication.path;
        config.authentication.authPath = currentAuthentication.authPath;

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

                        mockOAuthApp.handler = currentAuthentication.authMock;

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

    beforeEach(function(done) {
        config.access.disable = true;
        config.authentication.checkHeaders = false;
        cacheUtils.clean();
        initializeUseCase(authenticationMechanism, function() {
            async.series([
                async.apply(serverMocks.mockPath, authenticationMechanism.path, mockOAuthApp),
                async.apply(serverMocks.mockPath, authenticationMechanism.authPath, mockOAuthApp),
                async.apply(serverMocks.mockPath, '/v3/projects', mockOAuthApp),
                async.apply(serverMocks.mockPath, '/pdp/v3', mockAccessApp),
                async.apply(serverMocks.mockPath, '/v2/op/update', mockTargetApp)
            ], done);
        });
    });

    afterEach(function(done) {
        config.access.disable = false;
        config.authentication.checkHeaders = true;

        proxyLib.stop(proxy, function(error) {
            serverMocks.stop(mockTarget, function() {
                serverMocks.stop(mockAccess, function() {
                    serverMocks.stop(mockOAuth, done);
                });
            });
        });
    });

    describe('[' + authenticationMechanism.module + '] ' +
    'When a request arrives for a user and the access.disable flag is true', function() {
        var options = {
                uri: 'http://127.0.0.1:' + config.resource.proxy.port + '/v2/op/update',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Fiware-Service': 'SmartValencia',
                    'fiware-servicepath': 'Electricidad',
                    'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
                },
                json: utils.readExampleFile('./test/orionRequests/v2EntityCreation.json')
            };

        it('shouldn\'t call the Access Control and should not extract the roles', function(done) {
            var accessControlCalled = false,
                rolesExtracted = false;

            mockOAuthApp.handler = function(req, res) {
                if (req.path === authenticationMechanism.authPath && req.method === 'POST') {
                    res.setHeader('X-Subject-Token', '092016b75474ea6b492e29fb69d23029');
                    res.status(201).json(utils.readExampleFile('./test/keystoneResponses/authorize.json'));
                } else if (req.path === authenticationMechanism.authPath && req.method === 'GET') {
                    res.status(200).json(utils.readExampleFile('./test/keystoneResponses/getUser.json'));
                } else if (req.url === '/v3/projects' && req.method === 'GET') {
                    rolesExtracted = true;
                    res.status(200).json(utils.readExampleFile('./test/keystoneResponses/getProjects.json'));
                } else {
                    rolesExtracted = true;
                    res.status(200).json(utils.readExampleFile('./test/keystoneResponses/rolesOfUserWithDomain.json'));
                }
            };

            mockAccessApp.handler = function(req, res) {
                accessControlCalled = true;
                res.status(200).send(utils.readExampleFile('./test/accessControlResponses/permitResponse.xml', true));
            };

            request(options, function(error, response, body) {
                accessControlCalled.should.equal(false);
                rolesExtracted.should.equal(false);
                done();
            });
        });
    });

    describe('[' + authenticationMechanism.module + '] ' +
    'When a request arrives for a user without the X-Auth-Token header and the access control is disabled', function() {
        var options = {
                uri: 'http://127.0.0.1:' + config.resource.proxy.port + '/v2/op/update',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                json: utils.readExampleFile('./test/orionRequests/v2EntityCreation.json')
            };

        it('should return a MISSING_HEADERS error', function(done) {
            var accessControlCalled = false,
                rolesExtracted = false;

            mockOAuthApp.handler = function(req, res) {
                if (req.path === authenticationMechanism.authPath && req.method === 'POST') {
                    res.setHeader('X-Subject-Token', '092016b75474ea6b492e29fb69d23029');
                    res.status(201).json(utils.readExampleFile('./test/keystoneResponses/authorize.json'));
                } else if (req.path === authenticationMechanism.authPath && req.method === 'GET') {
                    res.status(200).json(utils.readExampleFile('./test/keystoneResponses/getUser.json'));
                } else if (req.url === '/v3/projects' && req.method === 'GET') {
                    rolesExtracted = true;
                    res.status(200).json(utils.readExampleFile('./test/keystoneResponses/getProjects.json'));
                } else {
                    rolesExtracted = true;
                    res.status(200).json(utils.readExampleFile('./test/keystoneResponses/rolesOfUserWithDomain.json'));
                }
            };

            mockAccessApp.handler = function(req, res) {
                accessControlCalled = true;
                res.status(200).send(utils.readExampleFile('./test/accessControlResponses/permitResponse.xml', true));
            };

            request(options, function(error, response, body) {
                response.statusCode.should.equal(400);
                done();
            });
        });
    });
});
