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
    orionPlugin = require('../../lib/services/orionPlugin'),
    keystoneAuth = require('../../lib/services/keystoneAuth'),
    async = require('async'),
    config = require('../../config'),
    utils = require('../tools/utils'),
    should = require('should'),
    request = require('request');

describe('Keystone authentication cache', function() {
    var proxy,
        mockTarget,
        mockTargetApp,
        mockAccess,
        mockAccessApp,
        mockOAuth,
        mockOAuthApp,
        currentAuthentication = {
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

    describe('When the keystone cache is activated and multiple requests for a user arrive', function() {
        var options = {
            uri: 'http://localhost:' + config.resource.proxy.port + '/NGSI10/updateContext',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Fiware-Service': 'SmartValencia',
                'fiware-servicepath': 'Electricidad',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
            },
            json: utils.readExampleFile('./test/orionRequests/entityCreation.json')
        };

        beforeEach(function(done) {
            keystoneAuth.cleanCache();
            initializeUseCase(currentAuthentication, function() {
                async.series([
                    async.apply(serverMocks.mockPath, currentAuthentication.path, mockOAuthApp),
                    async.apply(serverMocks.mockPath, currentAuthentication.authPath, mockOAuthApp),
                    async.apply(serverMocks.mockPath, '/v3/projects', mockOAuthApp),
                    async.apply(serverMocks.mockPath, '/pdp/v3', mockAccessApp),
                    async.apply(serverMocks.mockPath, '/NGSI10/updateContext', mockTargetApp)
                ], done);
            });
        });

        afterEach(function(done) {
            keystoneAuth.cleanCache();

            proxyLib.stop(proxy, function(error) {
                serverMocks.stop(mockTarget, function() {
                    serverMocks.stop(mockAccess, function() {
                        serverMocks.stop(mockOAuth, done);
                    });
                });
            });
        });

        it('should send a single request to Keystone asking for user data', function(done) {
            var userAccesses = 0;

            mockOAuthApp.handler = function(req, res) {
                if (req.path === currentAuthentication.authPath && req.method === 'POST') {
                    res.setHeader('X-Subject-Token', '4e92e29a90fb20701692236b4b69d547');
                    res.json(201, utils.readExampleFile('./test/keystoneResponses/authorize.json'));
                } else if (req.path === '/v3/projects' && req.method === 'GET') {
                    res.json(200, utils.readExampleFile('./test/keystoneResponses/getProjects.json'));
                } else if (req.path === currentAuthentication.authPath && req.method === 'GET') {
                    userAccesses++;
                    res.json(200, utils.readExampleFile('./test/keystoneResponses/getUser.json'));
                } else {
                    res.json(200, utils.readExampleFile('./test/keystoneResponses/rolesOfUser.json'));
                }
            };

            async.series([
                async.apply(request, options),
                async.apply(request, options),
                async.apply(request, options),
                async.apply(request, options),
                async.apply(request, options)
            ], function(error, results) {
                should.not.exist(error);
                userAccesses.should.equal(1);
                done();
            });
        });

        it('should send a single request to Keystone asking for project data', function(done) {
            var projectIDAccesses = 0;

            mockOAuthApp.handler = function(req, res) {
                if (req.path === currentAuthentication.authPath && req.method === 'POST') {
                    res.setHeader('X-Subject-Token', '4e92e29a90fb20701692236b4b69d547');
                    res.json(201, utils.readExampleFile('./test/keystoneResponses/authorize.json'));
                } else if (req.path === '/v3/projects' && req.method === 'GET') {
                    projectIDAccesses++;
                    res.json(200, utils.readExampleFile('./test/keystoneResponses/getProjects.json'));
                } else if (req.path === currentAuthentication.authPath && req.method === 'GET') {
                    res.json(200, utils.readExampleFile('./test/keystoneResponses/getUser.json'));
                } else {
                    res.json(200, utils.readExampleFile('./test/keystoneResponses/rolesOfUser.json'));
                }
            };

            async.series([
                async.apply(request, options),
                async.apply(request, options),
                async.apply(request, options),
                async.apply(request, options),
                async.apply(request, options)
            ], function(error, results) {
                should.not.exist(error);
                projectIDAccesses.should.equal(1);
                done();
            });
        });
    });
});
