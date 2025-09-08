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
    utils = require('../tools/utils'),
    keystonePlugin = require('../../lib/services/keystoneAuth'),
    cacheUtils = require('../../lib/services/cacheUtils'),
    async = require('async'),
    should = require('should'),
    request = require('../../lib/request-shim');


describe('Extract Context Broker action from request', function() {
    var proxy,
        mockServer,
        mockApp,
        mockAccess,
        mockAccessApp,
        mockOAuth,
        mockOAuthApp;

    function testAction(action, options) {
        return function(done) {
            var extractionExecuted = false;

            var testExtraction = function(req, res, callback) {
                should.exist(req.action);
                req.action.should.equal(action);
                extractionExecuted = true;
                callback(null, req, res);
            };

            proxy.middlewares.push(testExtraction);

            request(options, function(error, response, body) {
                extractionExecuted.should.equal(true);
                done();
            });
        };
    }

    beforeEach(function(done) {
        proxyLib.start(function(error, proxyObj) {
            proxy = proxyObj;

            proxy.middlewares.push(orionPlugin.extractCBAction);

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

                        mockOAuthApp.handler = serverMocks.mockKeystone;
                        cacheUtils.clean();
                        keystonePlugin.invalidate();

                        async.series([
                            async.apply(serverMocks.mockPath, '/validate', mockAccessApp),
                            async.apply(serverMocks.mockPath, '/v3/auth/tokens', mockOAuthApp)
                        ], done);
                    });
                });
            });
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

    var standardOperation = [
        ['/v2/op/query', 'read']
    ];

    function testStandardOperation(url, action) {
        return function() {
            var options = {
                uri: 'http://localhost:' + config.resource.proxy.port + url,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'fiware-service': 'SmartValencia',
                    'fiware-servicepath': 'Electricidad',
                    'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
                },
                json: utils.readExampleFile('./test/orionRequests/v2QueryContext.json')
            };

            it('should add the action attribute with value "' + action + '" to the request',
                testAction(action, options));
        };
    }

    for (var i = 0; i < standardOperation.length; i++) {
        describe('When a standard action with url' + standardOperation[i][0] + ' arrives', testStandardOperation(
            standardOperation[i][0],
            standardOperation[i][1]
        ));
    }

    describe('When a update action arrives with a URL that it\'s not recognized by the system', function() {
        var options = {
            uri: 'http://localhost:' + config.resource.proxy.port + '/falsePath',
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml',
                'Accept': 'application/xml',
                'fiware-service': 'SmartValencia',
                'fiware-servicepath': 'Electricidad',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
            },
            body: utils.readExampleFile('./test/orionRequests/v2EntityCreation.json', true)
        };

        it('should reject the request with a 400 Bad Request code', function(done) {
            request(options, function(error, response, body) {
                response.statusCode.should.equal(400);
                done();
            });
        });
    });


    var v2UpdateOperationMatrix = [
        ['append', 'create'],
        ['appendStrict', 'create'],
        ['update', 'update'],
        ['delete', 'delete'],
        ['replace', 'update']
    ];

    function testV2updateAction(index) {
        describe('When a request arrives with a valid v2 JSON /op/update "' + v2UpdateOperationMatrix[index][0] +
            '" payload to the proxy', function() {

            var options = {
                uri: 'http://localhost:' + config.resource.proxy.port + '/v2/op/update',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'fiware-service': 'SmartValencia',
                    'fiware-servicepath': 'Electricidad',
                    'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
                },
                json: utils.readExampleFile('./test/orionRequests/v2EntityCreation.json')
            };

            beforeEach(function(done) {
                options.json.actionType = v2UpdateOperationMatrix[index][0];

                async.series([
                    async.apply(serverMocks.mockPath, '/v3/role_assignments', mockOAuthApp),
                    async.apply(serverMocks.mockPath, '/v3/auth/tokens', mockOAuthApp),
                    async.apply(serverMocks.mockPath, '/v3/projects', mockOAuthApp),
                    async.apply(serverMocks.mockPath, '/pdp/v3', mockAccessApp),
                    async.apply(serverMocks.mockPath, '/v2/op/update', mockApp)
                ], done);
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

            it('should add the action attribute with value "' + v2UpdateOperationMatrix[index][1] + '" to the request',
                testAction(v2UpdateOperationMatrix[index][1], options));
        });
    }

    for (var p = 0; p < v2UpdateOperationMatrix.length; p++) {
        testV2updateAction(p);
    }
});
