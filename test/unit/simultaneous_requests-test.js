/*
 * Copyright 2016 Telefonica Investigación y Desarrollo, S.A.U
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
    proxyPlugin = require('../../lib/middleware/proxy'),
    config = require('../../config'),
    utils = require('../tools/utils'),
    should = require('should'),
    async = require('async'),
    request = require('../../lib/utils/requestWrapper'),
    correlatorIds = [],
    correlatorIdsPost = [],
    sendRequestBackup;

describe('Simultaneous requests', function() {
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

    function initializeUseCase(currentAuthentication, authMock, done) {
        config.authentication.module = currentAuthentication.module;
        config.authentication.path = currentAuthentication.path;
        config.authentication.authPath = currentAuthentication.authPath;

        proxyLib.start(function(error, proxyObj) {
            if (error) {
                return done(error);
            }
            
            var testExtraction = function(req, res, callback) {
                correlatorIds.push(req.corr);
                callback(null, req, res);
            };

            proxy = proxyObj;

            proxy.middlewares.push(orionPlugin.extractCBAction);
            proxy.middlewares.push(testExtraction);

            serverMocks.start(config.resource.original.port, function(error, server, app) {
                if (error) {
                    return done(error);
                }
                
                mockTarget = server;
                mockTargetApp = app;
                serverMocks.start(config.access.port, function(error, serverAccess, appAccess) {
                    if (error) {
                        return done(error);
                    }
                    
                    mockAccess = serverAccess;
                    mockAccessApp = appAccess;
                    serverMocks.start(config.authentication.options.port, function(error, serverAuth, appAuth) {
                        if (error) {
                            return done(error);
                        }
                        
                        mockOAuth = serverAuth;
                        mockOAuthApp = appAuth;

                        mockOAuthApp.handler = authMock;

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

    var options = {
        uri: 'http://localhost:' + config.resource.proxy.port + '/v2/op/update',
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

    describe('When two requests arrive simultaneusly with successful tokens', function() {
        beforeEach(function(done) {
            cacheUtils.clean();

            correlatorIds = [];
            correlatorIdsPost = [];

            sendRequestBackup = proxyPlugin.sendRequest;
            proxyPlugin.sendRequest = function(req, res, next) {
                correlatorIdsPost.push(req.corr);
                sendRequestBackup(req, res, next);
            };

            initializeUseCase(currentAuthentication, currentAuthentication.authMock, function() {
                async.series([
                    async.apply(serverMocks.mockPath, currentAuthentication.path, mockOAuthApp),
                    async.apply(serverMocks.mockPath, currentAuthentication.authPath, mockOAuthApp),
                    async.apply(serverMocks.mockPath, '/v3/projects', mockOAuthApp),
                    async.apply(serverMocks.mockPath, '/pdp/v3', mockAccessApp),
                    async.apply(serverMocks.mockPath, '/v2/op/update', mockTargetApp)
                ], function() {
                    cacheUtils.clean();
                    done();
                });
            });
        });

        afterEach(function(done) {
            proxyPlugin.sendRequest = sendRequestBackup;

            proxyLib.stop(proxy, function(error) {
                serverMocks.stop(mockTarget, function() {
                    serverMocks.stop(mockAccess, function() {
                        serverMocks.stop(mockOAuth, done);
                    });
                });
            });
        });

        it('should end up correctly', function(done) {
            async.parallel([
                request.bind(null, options),
                request.bind(null, options)
            ], function(error, results) {
                should.not.exist(error);
                results[0][0].statusCode.should.equal(200);
                results[1][0].statusCode.should.equal(200);
                done();
            });
        });
        it('should have two different correlator IDs before the authentication', function(done) {
            async.parallel([
                request.bind(null, options),
                request.bind(null, options)
            ], function(error, results) {
                should.not.exist(error);
                correlatorIds[0].should.not.equal(correlatorIds[1]);
                done();
            });
        });
        it('should have two different correlator IDs after the authentication', function(done) {
            async.parallel([
                request.bind(null, options),
                request.bind(null, options)
            ], function(error, results) {
                should.not.exist(error);
                correlatorIdsPost[0].should.not.equal(correlatorIdsPost[1]);
                done();
            });
        });
    });

    describe('When two requests arrive simultaneusly with wrong tokens', function() {
        beforeEach(function(done) {
            cacheUtils.clean();

            correlatorIds = [];
            correlatorIdsPost = [];

            sendRequestBackup = proxyPlugin.sendRequest;
            proxyPlugin.sendRequest = function(req, res, next) {
                correlatorIdsPost.push(req.corr);
                sendRequestBackup(req, res, next);
            };

            function failAuthMock(req, res) {
                if (req.path === '/v3/auth/tokens' && req.method === 'POST') {
                    res.setHeader('X-Subject-Token', '092016b75474ea6b492e29fb69d23029');
                    res.status(201).json(utils.readExampleFile('./test/keystoneResponses/authorize.json'));
                } else if (req.path === '/v3/auth/tokens' && req.method === 'GET') {
                    res.status(404).json(utils.readExampleFile('./test/keystoneResponses/getUser.json'));
                } else if (req.path === '/v3/projects' && req.method === 'GET') {
                    res.status(200).json(utils.readExampleFile('./test/keystoneResponses/getProjects.json'));
                } else {
                    res.status(200).json(utils.readExampleFile('./test/keystoneResponses/rolesOfUser.json'));
                }
            }

            initializeUseCase(currentAuthentication, failAuthMock, function() {
                async.series([
                    async.apply(serverMocks.mockPath, currentAuthentication.path, mockOAuthApp),
                    async.apply(serverMocks.mockPath, currentAuthentication.authPath, mockOAuthApp),
                    async.apply(serverMocks.mockPath, '/v3/projects', mockOAuthApp),
                    async.apply(serverMocks.mockPath, '/pdp/v3', mockAccessApp),
                    async.apply(serverMocks.mockPath, '/v2/op/update', mockTargetApp)
                ], function() {
                    cacheUtils.clean();
                    done();
                });
            });
        });

        afterEach(function(done) {
            proxyPlugin.sendRequest = sendRequestBackup;

            proxyLib.stop(proxy, function(error) {
                serverMocks.stop(mockTarget, function() {
                    serverMocks.stop(mockAccess, function() {
                        serverMocks.stop(mockOAuth, done);
                    });
                });
            });
        });

        it('should end up correctly', function(done) {
            async.parallel([
                request.bind(null, options),
                request.bind(null, options)
            ], function(error, results) {
                should.not.exist(error);
                results[0][0].statusCode.should.equal(401);
                results[1][0].statusCode.should.equal(401);
                done();
            });
        });
    });
});
