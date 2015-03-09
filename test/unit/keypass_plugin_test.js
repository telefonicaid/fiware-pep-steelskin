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
 * please contact with::[daniel.moranjimenez@telefonica.com]
 */

'use strict';

var serverMocks = require('../tools/serverMocks'),
    proxyLib = require('../../lib/fiware-orion-pep'),
    keypassPlugin = require('../../lib/plugins/keypassPlugin'),
    keystonePlugin = require('../../lib/services/keystoneAuth'),
    config = require('../../config'),
    utils = require('../tools/utils'),
    should = require('should'),
    async = require('async'),
    request = require('request');

describe('Keypass Plugin tests', function() {
    var proxy,
        mockTarget,
        mockTargetApp,
        mockServer,
        mockApp,
        mockAccess,
        mockAccessApp,
        mockOAuth,
        mockOAuthApp,
        apiCases = [
            ['POST', '/pap/v1/subject/1234512', 'createPolicy'],
            ['GET', '/pap/v1/subject/61345', 'listPolicies'],
            ['DELETE', '/pap/v1/subject/1345', 'deleteSubjectPolicies'],
            ['DELETE', '/pap/v1', 'deleteTenantPolicies'],
            ['GET', '/pap/v1/subject/12354/policy/143', 'readPolicy'],
            ['DELETE', '/pap/v1/subject/16412/policy/1235', 'deletePolicy']
        ],
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

    function apiCase(particularCase) {
        var options = {
            uri: 'http://localhost:' + config.resource.proxy.port + particularCase[1],
            method: particularCase[0],
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Fiware-Service': 'SmartValencia',
                'fiware-servicepath': 'Electricidad',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
            },
            json: {}
        };

        describe('When  a ' + particularCase[0] + ' request arrives to the ' +
        particularCase[1] + ' url of Keypass PAP through the PEP Proxy', function() {

            beforeEach(function(done) {
                config.middlewares.require = 'lib/services/keypassPlugin';
                config.middlewares.function = [
                    'extractAction'
                ];

                keystonePlugin.cleanCache();

                proxyLib.start(function(error, proxyObj) {
                    proxy = proxyObj;

                    proxy.middlewares.push(keypassPlugin.extractAction);

                    serverMocks.start(config.resource.original.port, function(error, server, app) {
                        mockServer = server;
                        mockApp = app;

                        serverMocks.start(config.access.port, function(error, serverAccess, appAccess) {
                            mockAccess = serverAccess;
                            mockAccessApp = appAccess;
                            mockAccessApp.handler = function(req, res) {
                                res.set('Content-Type', 'application/xml');
                                res.send(utils.readExampleFile('./test/accessControlResponses/permitResponse.xml',
                                    true));
                            };

                            serverMocks.start(config.authentication.options.port, function(error, serverAuth, appAuth) {
                                mockOAuth = serverAuth;
                                mockOAuthApp = appAuth;

                                mockOAuthApp.handler = function(req, res) {
                                    res.json(200,
                                        utils.readExampleFile('./test/authorizationResponses/rolesOfUser.json'));
                                };

                                async.series([
                                    async.apply(serverMocks.mockPath, '/user', mockOAuthApp),
                                    async.apply(serverMocks.mockPath, '/validate', mockAccessApp),
                                    async.apply(serverMocks.mockPath, '/generalResource', mockAccessApp)
                                ], done);
                            });
                        });
                    });
                });
            });

            it('should mark the action as "' + particularCase[2] + '"', function(done) {
                var extractionExecuted = false;

                var testExtraction = function(req, res, callback) {
                    should.exist(req.action);
                    req.action.should.equal(particularCase[2]);
                    extractionExecuted = true;
                    callback(null, req, res);
                };

                proxy.middlewares.push(testExtraction);

                request(options, function(error, response, body) {
                    extractionExecuted.should.equal(true);
                    done();
                });
            });

            afterEach(function(done) {
                proxyLib.stop(proxy, function(error) {
                    serverMocks.stop(mockServer, function() {
                        serverMocks.stop(mockAccess, function() {
                            serverMocks.stop(mockOAuth, done);
                        });
                    });
                });
            });
        });
    }

    apiCases.forEach(apiCase);

    describe('When a request arrives at the Keypass PDP through the PEP Proxy', function() {
        function initializeUseCase(currentAuthentication, done) {
            config.authentication.module = currentAuthentication.module;
            config.authentication.path = currentAuthentication.path;
            config.authentication.authPath = currentAuthentication.authPath;

            proxyLib.start(function(error, proxyObj) {
                proxy = proxyObj;

                proxy.middlewares.push(keypassPlugin.extractAction);

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

                            done();
                        });
                    });
                });
            });
        }

        beforeEach(function(done) {
            keystonePlugin.cleanCache();

            initializeUseCase(authenticationMechanism, function() {
                async.series([
                    async.apply(serverMocks.mockPath, authenticationMechanism.path, mockOAuthApp),
                    async.apply(serverMocks.mockPath, authenticationMechanism.authPath, mockOAuthApp),
                    async.apply(serverMocks.mockPath, '/v3/projects', mockOAuthApp),
                    async.apply(serverMocks.mockPath, '/pdp/v3', mockAccessApp),
                    async.apply(serverMocks.mockPath, '/pdp/v3', mockTargetApp)
                ], done);
            });
        });

        afterEach(function(done) {
            delete config.bypass;
            delete config.bypassRoleId;

            proxyLib.stop(proxy, function(error) {
                serverMocks.stop(mockTarget, function() {
                    serverMocks.stop(mockAccess, function() {
                        serverMocks.stop(mockOAuth, done);
                    });
                });
            });
        });

        var options = {
            uri: 'http://localhost:' + config.resource.proxy.port + '/pdp/v3',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Fiware-Service': 'SmartValencia',
                'fiware-servicepath': 'Electricidad',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
            },
            json: {}
        };

        it('should bypass the validation', function(done) {
            var accessControlExecuted = false,
                requestProxyed = false;

            mockTargetApp.handler = function(req, res) {
                requestProxyed = true;
                res.json(200, {});
            };

            mockAccessApp.handler = function(req, res) {
                accessControlExecuted = true;
                res.json(501, {});
            };

            request(options, function(error, response, body) {
                should.not.exist(error);
                accessControlExecuted.should.equal(false);
                requestProxyed.should.equal(true);
                done();
            });
        });
    });
});
