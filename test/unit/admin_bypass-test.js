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
    config = require('../../config'),
    utils = require('../tools/utils'),
    should = require('should'),
    request = require('request');

function mockKeystone(req, res) {
    if (req.path === '/v3/auth/tokens' && req.method === 'POST') {
        res.setHeader('X-Subject-Token', '092016b75474ea6b492e29fb69d23029');
        res.json(201, utils.readExampleFile('./test/keystoneResponses/authorize.json'));
    } else if (req.path === '/v3/auth/tokens' && req.method === 'GET') {
        res.json(200, utils.readExampleFile('./test/keystoneResponses/getUser.json'));
    } else if (req.path === '/v3/projects' && req.method === 'GET') {
        res.json(200, utils.readExampleFile('./test/keystoneResponses/getProjects.json'));
    } else {
        res.json(200, utils.readExampleFile('./test/keystoneResponses/rolesOfUser.json'));
    }
}

describe('Admin bypass tests', function() {
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
            authMock: mockKeystone
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

                        done();
                    });
                });
            });
        });
    }

    describe('[' + authenticationMechanism.module + '] ' +
    'When a request arrives to the PEP and for a user with the admin role', function() {
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
            },
            currentAuthentication = authenticationMechanism;

        beforeEach(function(done) {
            config.bypass = true;
            config.bypassRoleId = 8907;
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

        it('should proxy the request without further validation', function(done) {
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
