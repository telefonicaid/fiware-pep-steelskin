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
    keystonePlugin = require('../../lib/services/keystoneAuth'),
    cacheUtils = require('../../lib/services/cacheUtils'),
    async = require('async'),
    config = require('../../config'),
    utils = require('../tools/utils'),
    should = require('should'),
    request = require('request');

function mockIdm(req, res) {
    if (req.path === '/user') {
        res.status(200).json(utils.readExampleFile('./test/authorizationResponses/rolesOfUser.json'));
    } else {
        res.status(200).json(utils.readExampleFile('./test/authorizationResponses/authorize.json'));
    }
}

describe('Validate action with Access Control', function() {
    /* jshint loopfunc: true */

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
                path: '/user',
                authPath: '/oauth2/authorize',
                rolesFile: './test/authorizationResponses/rolesOfUser.json',
                authenticationResponse: './test/authorizationResponses/authorize.json',
                headers: [
                ],
                authMock: mockIdm
            },
            {
                module: 'keystone',
                path: '/v3/role_assignments',
                authPath: '/v3/auth/tokens',
                rolesFile: './test/keystoneResponses/rolesOfUser.json',
                authenticationResponse: './test/keystoneResponses/authorize.json',
                headers: [
                ],
                authMock: serverMocks.mockKeystone
            }
        ];

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

    for (var q = 0; q < authenticationMechanisms.length; q++) {
        describe('[' + authenticationMechanisms[q].module +
            '] When a request to the CB arrives to the proxy with appropriate permissions', function() {
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
                },
                currentAuthentication = authenticationMechanisms[q];


            beforeEach(function(done) {
                initializeUseCase(currentAuthentication, function() {
                    async.series([
                        async.apply(serverMocks.mockPath, currentAuthentication.path, mockOAuthApp),
                        async.apply(serverMocks.mockPath, currentAuthentication.authPath, mockOAuthApp),
                        async.apply(serverMocks.mockPath, '/v3/projects', mockOAuthApp),
                        async.apply(serverMocks.mockPath, '/pdp/v3', mockAccessApp),
                        async.apply(serverMocks.mockPath, '/v2/op/update', mockTargetApp)
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

        describe('[' + authenticationMechanisms[q].module +
            '] When a request to the CB arrives for a user with wrong permissions', function() {
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
                },
                currentAuthentication = authenticationMechanisms[q];

            beforeEach(function(done) {
                initializeUseCase(currentAuthentication, function() {
                    async.series([
                        async.apply(serverMocks.mockPath, currentAuthentication.path, mockOAuthApp),
                        async.apply(serverMocks.mockPath, currentAuthentication.authPath, mockOAuthApp),
                        async.apply(serverMocks.mockPath, '/v3/projects', mockOAuthApp),
                        async.apply(serverMocks.mockPath, '/pdp/v3', mockAccessApp),
                        async.apply(serverMocks.mockPath, '/v2/op/update', mockTargetApp)
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
                    res.status(200).json({});
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
                    uri: 'http://localhost:' + config.resource.proxy.port + '/v2/op/update',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Fiware-Service': 'SmartValencia',
                        'Fiware-Servicepath': 'Electricidad',
                        'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
                    },
                    json: utils.readExampleFile('./test/orionRequests/v2EntityCreation.json')
                },
                currentAuthentication = authenticationMechanisms[q];

            beforeEach(function(done) {
                initializeUseCase(currentAuthentication, function() {
                    serverMocks.stop(mockAccess, function() {
                        async.series([
                            async.apply(serverMocks.mockPath, currentAuthentication.path, mockOAuthApp),
                            async.apply(serverMocks.mockPath, currentAuthentication.authPath, mockOAuthApp),
                            async.apply(serverMocks.mockPath, '/v3/projects', mockOAuthApp),
                            async.apply(serverMocks.mockPath, '/pdp/v3', mockAccessApp),
                            async.apply(serverMocks.mockPath, '/v2/op/update', mockTargetApp)
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

            it('should reject the request with a 500 error', function(done) {
                var mockExecuted = false;

                mockAccessApp.handler = function(req, res) {
                    mockExecuted = true;
                    res.status(500).json({});
                };

                request(options, function(error, response, body) {
                    should.exist(mockExecuted);
                    response.statusCode.should.equal(500);
                    done();
                });
            });
        });


        describe('[' + authenticationMechanisms[q].module + '] ' +
            'When a request to the CB arrives and the Access Control fails to make a proper decision', function() {
            var options = {
                    uri: 'http://localhost:' + config.resource.proxy.port + '/v2/op/update',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Fiware-Service': 'SmartValencia',
                        'Fiware-Servicepath': 'Electricidad',
                        'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
                    },
                    json: utils.readExampleFile('./test/orionRequests/v2EntityCreation.json')
                },
                currentAuthentication = authenticationMechanisms[q];

            beforeEach(function(done) {
                initializeUseCase(currentAuthentication, function() {
                    async.series([
                        async.apply(serverMocks.mockPath, currentAuthentication.path, mockOAuthApp),
                        async.apply(serverMocks.mockPath, currentAuthentication.authPath, mockOAuthApp),
                        async.apply(serverMocks.mockPath, '/v3/projects', mockOAuthApp),
                        async.apply(serverMocks.mockPath, '/pdp/v3', mockAccessApp),
                        async.apply(serverMocks.mockPath, '/v2/op/update', mockTargetApp)
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

            it('should reject the request with a 500 error', function(done) {
                var mockExecuted = false;

                mockAccessApp.handler = function(req, res) {
                    mockExecuted = true;
                    res.status(500).json({});
                };

                request(options, function(error, response, body) {
                    should.exist(mockExecuted);
                    response.statusCode.should.equal(500);
                    done();
                });
            });
        });
    }

    describe('[' + authenticationMechanisms[1].module + '] ' +
    'When a request arrives and the authentication token has expired', function() {
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
            },
            currentAuthentication = authenticationMechanisms[1];

        beforeEach(function(done) {
            cacheUtils.clean();

            initializeUseCase(currentAuthentication, function() {
                async.series([
                    keystonePlugin.invalidate,
                    async.apply(serverMocks.mockPath, currentAuthentication.path, mockOAuthApp),
                    async.apply(serverMocks.mockPath, currentAuthentication.authPath, mockOAuthApp),
                    async.apply(serverMocks.mockPath, '/v3/projects', mockOAuthApp),
                    async.apply(serverMocks.mockPath, '/pdp/v3', mockAccessApp),
                    async.apply(serverMocks.mockPath, '/v2/op/update', mockTargetApp)
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

        it('should reject the request with a 500 error', function(done) {
            mockOAuthApp.handler = function(req, res) {
                if (req.path === currentAuthentication.authPath && req.method === 'POST') {
                    res.status(401).json(utils.readExampleFile('./test/keystoneResponses/authorize.json'));
                }
            };

            request(options, function(error, response, body) {
                response.statusCode.should.equal(500);
                should.exist(body.name);
                body.name.should.equal('PEP_PROXY_AUTHENTICATION_REJECTED');
                done();
            });
        });
    });

    describe('[' + authenticationMechanisms[1].module + '] ' +
        'When a request is validated using Keystone', function() {
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
            },
            currentAuthentication = authenticationMechanisms[1];

        beforeEach(function(done) {
            cacheUtils.clean();

            initializeUseCase(currentAuthentication, function() {
                async.series([
                    keystonePlugin.invalidate,
                    async.apply(serverMocks.mockPath, currentAuthentication.path, mockOAuthApp),
                    async.apply(serverMocks.mockPath, currentAuthentication.authPath, mockOAuthApp),
                    async.apply(serverMocks.mockPath, '/v3/projects', mockOAuthApp),
                    async.apply(serverMocks.mockPath, '/pdp/v3', mockAccessApp),
                    async.apply(serverMocks.mockPath, '/v2/op/update', mockTargetApp)
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

        it('should authenticate to get the administration token', function(done) {
            var mockExecuted = false;

            mockOAuthApp.handler = function(req, res) {
                if (req.path === currentAuthentication.authPath && req.method === 'POST') {
                    should.exist(req.body);
                    should.exist(req.body.auth);
                    should.exist(req.body.auth.identity);
                    should.exist(req.body.auth.identity.password);
                    should.exist(req.body.auth.identity.password.user);
                    should.exist(req.body.auth.scope.domain.name);
                    should.exist(req.body.auth.identity.password.user.domain);

                    req.body.auth.scope.domain.name.should.equal(config.authentication.domainName);
                    req.body.auth.identity.password.user.domain.name.should.equal(config.authentication.domainName);

                    req.body.auth.identity.password.user.name.should.equal(config.authentication.user);
                    req.body.auth.identity.password.user.password.should.equal(config.authentication.password);

                    res.setHeader('X-Subject-Token', '092016b75474ea6b492e29fb69d23029');
                    res.status(201).json(utils.readExampleFile('./test/keystoneResponses/authorize.json'));
                    mockExecuted = true;
                } else if (req.path === currentAuthentication.authPath && req.method === 'GET') {
                    res.status(200).json(utils.readExampleFile('./test/keystoneResponses/getUser.json'));
                } else {
                    res.status(200).json(utils.readExampleFile('./test/keystoneResponses/rolesOfUser.json'));
                }
            };

            request(options, function(error, response, body) {
                mockExecuted.should.equal(true);
                done();
            });
        });

        it('should get user data', function(done) {
            var mockExecuted = false;

            mockOAuthApp.handler = function(req, res) {
                if (req.path === currentAuthentication.authPath && req.method === 'POST') {
                    res.setHeader('X-Subject-Token', '092016b75474ea6b492e29fb69d23029');
                    res.status(201).json(utils.readExampleFile('./test/keystoneResponses/authorize.json'));
                } else if (req.path === currentAuthentication.authPath && req.method === 'GET') {
                    should.exist(req.headers['x-auth-token']);
                    should.exist(req.headers['x-subject-token']);
                    req.headers['x-auth-token'].should.equal('092016b75474ea6b492e29fb69d23029');
                    req.headers['x-subject-token'].should.equal('UAidNA9uQJiIVYSCg0IQ8Q');
                    res.status(200).json(utils.readExampleFile('./test/keystoneResponses/getUser.json'));
                    mockExecuted = true;
                } else {
                    res.status(200).json(utils.readExampleFile('./test/keystoneResponses/rolesOfUser.json'));
                }
            };

            request(options, function(error, response, body) {
                mockExecuted.should.equal(true);
                done();
            });
        });
        it('should send an authenticated call to get the subservice ID', function(done) {
            var mockExecuted = false;

            mockOAuthApp.handler = function(req, res) {
                /* jshint camelcase: false */

                if (req.path === currentAuthentication.authPath && req.method === 'POST') {
                    res.setHeader('X-Subject-Token', '092016b75474ea6b492e29fb69d23029');
                    res.status(201).json(utils.readExampleFile('./test/keystoneResponses/authorize.json'));
                } else if (req.path === currentAuthentication.authPath && req.method === 'GET') {
                    res.status(200).json(utils.readExampleFile('./test/keystoneResponses/getUser.json'));
                } else if (req.path === '/v3/projects' && req.method === 'GET') {
                    should.exist(req.headers['x-auth-token']);
                    should.exist(req.query.domain_id);
                    should.exist(req.query.name);
                    req.query.domain_id.should.equal('f7a5b8e303ec43e8a912fe26fa79dc02');
                    req.query.name.should.equal('Electricidad');
                    req.headers['x-auth-token'].should.equal('092016b75474ea6b492e29fb69d23029');
                    mockExecuted = true;
                    res.status(200).json(utils.readExampleFile('./test/keystoneResponses/getProjects.json'));
                } else {
                    res.status(200).json(utils.readExampleFile('./test/keystoneResponses/rolesOfUser.json'));
                }
            };

            request(options, function(error, response, body) {
                mockExecuted.should.equal(true);
                done();
            });
        });
        it('should send an authenticated call to get the roles', function(done) {
            var mockExecuted = false;

            mockOAuthApp.handler = function(req, res) {
                if (req.path === currentAuthentication.authPath && req.method === 'POST') {
                    res.setHeader('X-Subject-Token', '092016b75474ea6b492e29fb69d23029');
                    res.status(201).json(utils.readExampleFile('./test/keystoneResponses/authorize.json'));
                } else if (req.path === currentAuthentication.authPath && req.method === 'GET') {
                    res.status(200).json(utils.readExampleFile('./test/keystoneResponses/getUser.json'));
                } else if (req.path === '/v3/projects' && req.method === 'GET') {
                    res.status(200).json(utils.readExampleFile('./test/keystoneResponses/getProjects.json'));
                } else {
                    should.exist(req.headers['x-auth-token']);
                    should.exist(req.query['user.id']);
                    req.query['user.id'].should.equal('5e817c5e0d624ee68dfb7a72d0d31ce4');
                    req.headers['x-auth-token'].should.equal('092016b75474ea6b492e29fb69d23029');
                    res.status(200).json(utils.readExampleFile('./test/keystoneResponses/rolesOfUser.json'));
                    mockExecuted = true;
                }
            };

            request(options, function(error, response, body) {
                mockExecuted.should.equal(true);
                done();
            });
        });
    });

    describe('[' + authenticationMechanisms[1].module + '] ' +
    'When a request arrives for a user that doesn\'t have a role on the subservice', function() {
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
            },
            currentAuthentication = authenticationMechanisms[1];

        beforeEach(function(done) {
            cacheUtils.clean();
            initializeUseCase(currentAuthentication, function() {
                async.series([
                    async.apply(serverMocks.mockPath, currentAuthentication.path, mockOAuthApp),
                    async.apply(serverMocks.mockPath, currentAuthentication.authPath, mockOAuthApp),
                    async.apply(serverMocks.mockPath, '/v3/projects', mockOAuthApp),
                    async.apply(serverMocks.mockPath, '/pdp/v3', mockAccessApp),
                    async.apply(serverMocks.mockPath, '/v2/op/update', mockTargetApp)
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

        it('should forbid its access with a 401', function(done) {
            var mockExecuted = false;

            mockOAuthApp.handler = function(req, res) {
                if (req.path === currentAuthentication.authPath && req.method === 'POST') {
                    res.setHeader('X-Subject-Token', '092016b75474ea6b492e29fb69d23029');
                    res.status(201).json(utils.readExampleFile('./test/keystoneResponses/authorize.json'));
                    mockExecuted = true;
                } else if (req.path === currentAuthentication.authPath && req.method === 'GET') {
                    res.status(200).json(utils.readExampleFile('./test/keystoneResponses/getUser.json'));
                } else {
                    res.status(200).json(
                        utils.readExampleFile('./test/keystoneResponses/rolesOfUserBadSubservice.json'));
                }
                mockExecuted = true;
            };

            request(options, function(error, response, body) {
                mockExecuted.should.equal(true);
                response.statusCode.should.equal(401);
                done();
            });
        });
    });

    describe('[' + authenticationMechanisms[1].module + '] ' +
    'When a request arrives for a user that has roles in the domain as well as in the project', function() {
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
            },
            currentAuthentication = authenticationMechanisms[1];

        beforeEach(function(done) {
            cacheUtils.clean();
            initializeUseCase(currentAuthentication, function() {
                async.series([
                    async.apply(serverMocks.mockPath, currentAuthentication.path, mockOAuthApp),
                    async.apply(serverMocks.mockPath, currentAuthentication.authPath, mockOAuthApp),
                    async.apply(serverMocks.mockPath, '/v3/projects', mockOAuthApp),
                    async.apply(serverMocks.mockPath, '/pdp/v3', mockAccessApp),
                    async.apply(serverMocks.mockPath, '/v2/op/update', mockTargetApp)
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

        it('should send an authenticated call to get the roles', function(done) {
            var mockExecuted = false;

            mockOAuthApp.handler = function(req, res) {
                if (req.path === currentAuthentication.authPath && req.method === 'POST') {
                    res.setHeader('X-Subject-Token', '092016b75474ea6b492e29fb69d23029');
                    res.status(201).json(utils.readExampleFile('./test/keystoneResponses/authorize.json'));
                } else if (req.path === currentAuthentication.authPath && req.method === 'GET') {
                    res.status(200).json(utils.readExampleFile('./test/keystoneResponses/getUser.json'));
                } else if (req.path === '/v3/projects' && req.method === 'GET') {
                    res.status(200).json(utils.readExampleFile('./test/keystoneResponses/getProjects.json'));
                } else {
                    should.exist(req.headers['x-auth-token']);
                    should.exist(req.query['user.id']);
                    should.exist(req.query.effective);
                    req.query['user.id'].should.equal('5e817c5e0d624ee68dfb7a72d0d31ce4');
                    req.query.effective.should.equal('true');
                    req.headers['x-auth-token'].should.equal('092016b75474ea6b492e29fb69d23029');
                    res.status(200).json(utils.readExampleFile('./test/keystoneResponses/rolesOfUserWithDomain.json'));
                    mockExecuted = true;
                }
            };

            request(options, function(error, response, body) {
                mockExecuted.should.equal(true);
                done();
            });
        });
    });

    describe('[' + authenticationMechanisms[1].module + '] ' +
    'When a request arrives for a user and the token is not valid', function() {
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
            },
            currentAuthentication = authenticationMechanisms[1];

        beforeEach(function(done) {
            cacheUtils.clean();
            initializeUseCase(currentAuthentication, function() {
                async.series([
                    async.apply(serverMocks.mockPath, currentAuthentication.path, mockOAuthApp),
                    async.apply(serverMocks.mockPath, currentAuthentication.authPath, mockOAuthApp),
                    async.apply(serverMocks.mockPath, '/v3/projects', mockOAuthApp),
                    async.apply(serverMocks.mockPath, '/pdp/v3', mockAccessApp),
                    async.apply(serverMocks.mockPath, '/v2/op/update', mockTargetApp)
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

        it('should return a 401 error, indicating the authentication was not valid', function(done) {
            var accessControlCalled = false;

            mockOAuthApp.handler = function(req, res) {
                if (req.path === currentAuthentication.authPath && req.method === 'POST') {
                    res.setHeader('X-Subject-Token', '092016b75474ea6b492e29fb69d23029');
                    res.status(201).json(utils.readExampleFile('./test/keystoneResponses/authorize.json'));
                } else if (req.path === currentAuthentication.authPath && req.method === 'GET') {
                    res.status(404).json(utils.readExampleFile('./test/keystoneResponses/tokenExpired.json'));
                }
            };

            mockAccessApp.handler = function(req, res) {
                accessControlCalled = true;
                res.status(200).send(utils.readExampleFile('./test/accessControlResponses/permitResponse.xml', true));
            };

            request(options, function(error, response, body) {
                response.statusCode.should.equal(401);
                accessControlCalled.should.equal(false);
                done();
            });
        });
    });

    describe('[' + authenticationMechanisms[1].module + '] ' +
    'When a request arrives and the access.disable flag is true and the authentication.checkHeaders flag is false',
        function() {
        var options = {
                uri: 'http://localhost:' + config.resource.proxy.port + '/v2/op/update',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
                },
                json: utils.readExampleFile('./test/orionRequests/v2EntityCreation.json')
            },
            currentAuthentication = authenticationMechanisms[1];

        beforeEach(function(done) {
            config.access.disable = true;
            config.authentication.checkHeaders = false;
            cacheUtils.clean();
            initializeUseCase(currentAuthentication, function() {
                async.series([
                    async.apply(serverMocks.mockPath, currentAuthentication.path, mockOAuthApp),
                    async.apply(serverMocks.mockPath, currentAuthentication.authPath, mockOAuthApp),
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

        it('should not check for the presence of the headers', function(done) {
            var keystoneCalled = false;

            mockOAuthApp.handler = function(req, res) {
                if (req.path === currentAuthentication.authPath && req.method === 'POST') {
                    res.setHeader('X-Subject-Token', '092016b75474ea6b492e29fb69d23029');
                    res.status(201).json(utils.readExampleFile('./test/keystoneResponses/authorize.json'));
                } else if (req.path === currentAuthentication.authPath && req.method === 'GET') {
                    keystoneCalled = true;
                    res.status(200).json(utils.readExampleFile('./test/keystoneResponses/getUser.json'));
                }
            };

            request(options, function(error, response, body) {
                response.statusCode.should.equal(200);
                keystoneCalled.should.equal(true);
                done();
            });
        });
    });

    describe('[' + authenticationMechanisms[1].module + '] ' +
        'When a request with a tenant A tries to access things on tenant B', function() {
        var options = {
                uri: 'http://localhost:' + config.resource.proxy.port + '/v2/op/update',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Fiware-Service': 'Mordor',
                    'fiware-servicepath': 'Electricidad',
                    'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
                },
                json: utils.readExampleFile('./test/orionRequests/v2EntityCreation.json')
            },
            currentAuthentication = authenticationMechanisms[1];

        beforeEach(function(done) {
            cacheUtils.clean();
            initializeUseCase(currentAuthentication, function() {
                async.series([
                    async.apply(serverMocks.mockPath, currentAuthentication.path, mockOAuthApp),
                    async.apply(serverMocks.mockPath, currentAuthentication.authPath, mockOAuthApp),
                    async.apply(serverMocks.mockPath, '/v3/projects', mockOAuthApp),
                    async.apply(serverMocks.mockPath, '/pdp/v3', mockAccessApp),
                    async.apply(serverMocks.mockPath, '/v2/op/update', mockTargetApp)
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

        it('should reject the request with a 401', function(done) {
            request(options, function(error, response, body) {
                response.statusCode.should.equal(401);
                body.name.should.equal('TOKEN_DOES_NOT_MATCH_SERVICE');
                done();
            });
        });
    });

    describe('[' + authenticationMechanisms[1].module + '] ' +
    'When a request is validated using a trust token in Keystone', function() {
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
            },
            currentAuthentication = authenticationMechanisms[1];

        beforeEach(function(done) {
            cacheUtils.clean();

            initializeUseCase(currentAuthentication, function() {
                async.series([
                    keystonePlugin.invalidate,
                    async.apply(serverMocks.mockPath, currentAuthentication.path, mockOAuthApp),
                    async.apply(serverMocks.mockPath, currentAuthentication.authPath, mockOAuthApp),
                    async.apply(serverMocks.mockPath, '/v3/projects', mockOAuthApp),
                    async.apply(serverMocks.mockPath, '/pdp/v3', mockAccessApp),
                    async.apply(serverMocks.mockPath, '/v2/op/update', mockTargetApp)
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

        it('should extract the correct domain from the user token response', function(done) {
            mockOAuthApp.handler = function(req, res) {
                if (req.path === currentAuthentication.authPath && req.method === 'POST') {
                    res.setHeader('X-Subject-Token', '092016b75474ea6b492e29fb69d23029');
                    res.status(201).json(utils.readExampleFile('./test/keystoneResponses/authorize.json'));
                } else if (req.path === currentAuthentication.authPath && req.method === 'GET') {
                    res.status(200).json(utils.readExampleFile('./test/keystoneResponses/getUserWithTrust.json'));
                } else if (req.path === '/v3/projects' && req.method === 'GET') {
                    res.status(200).json(utils.readExampleFile('./test/keystoneResponses/getProjects.json'));
                } else {
                    req.query['user.id'].should.equal('5e817c5e0d624ee68dfb7a72d0d31ce4');
                    req.headers['x-auth-token'].should.equal('092016b75474ea6b492e29fb69d23029');
                    res.status(200).json(utils.readExampleFile('./test/keystoneResponses/rolesOfUser.json'));
                }
            };

            request(options, function(error, response, body) {
                response.statusCode.should.equal(200);
                done();
            });
        });
    });
});
