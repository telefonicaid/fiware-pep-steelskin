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
    orionPlugin = require('../../lib/plugins/orionPlugin'),
    config = require('../../config'),
    utils = require('../tools/utils'),
    async = require('async'),
    should = require('should'),
    request = require('request');


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

                        async.series([
                            async.apply(serverMocks.mockPath, '/validate', mockAccessApp)
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
        ['/NGSI10/queryContext', 'read'],
        ['/ngsi10/subscribeContext', 'subscribe'],
        ['/ngsi10/updateContextSubscription', 'subscribe'],
        ['/ngsi10/unsubscribeContext', 'subscribe'],
        ['/ngsi9/registerContext', 'register'],
        ['/ngsi9/discoverContextAvailability', 'discover'],
        ['/ngsi9/subscribeContextAvailability', 'subscribe-availability'],
        ['/ngsi9/updateContextAvailabilitySubscription', 'subscribe-availability'],
        ['/ngsi9/unsubscribeContextAvailability', 'subscribe-availability'],
        ['/v1/queryContext', 'read'],
        ['/v1/contextTypes', 'read'],
        ['/v1/subscribeContext', 'subscribe'],
        ['/v1/updateContextSubscription', 'subscribe'],
        ['/v1/unsubscribeContext', 'subscribe'],
        ['/v1/registry/registerContext', 'register'],
        ['/v1/registry/discoverContextAvailability', 'discover'],
        ['/v1/registry/subscribeContextAvailability', 'subscribe-availability'],
        ['/v1/registry/updateContextAvailabilitySubscription', 'subscribe-availability'],
        ['/v1/registry/unsubscribeContextAvailability', 'subscribe-availability']
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
                json: utils.readExampleFile('./test/orionRequests/queryContext.json')
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

    describe('When a create action arrives with JSON payload and the "/NGSI10" prefix', function() {
        var options = {
            uri: 'http://localhost:' + config.resource.proxy.port + '/NGSI10/updateContext',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'fiware-service': 'SmartValencia',
                'fiware-servicepath': 'Electricidad',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
            },
            json: utils.readExampleFile('./test/orionRequests/entityCreation.json')
        };

        beforeEach(function(done) {
            serverMocks.mockPath('/NGSI10/queryContext', mockApp, done);
        });

        it('should add the action attribute with value "create" to the request', testAction('create', options));
    });

    describe('When a create action arrives with JSON payload and the "/v1" prefix', function() {
        var options = {
            uri: 'http://localhost:' + config.resource.proxy.port + '/v1/updateContext',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'fiware-service': 'SmartValencia',
                'fiware-servicepath': 'Electricidad',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
            },
            json: utils.readExampleFile('./test/orionRequests/entityCreation.json')
        };

        beforeEach(function(done) {
            serverMocks.mockPath('/NGSI10/queryContext', mockApp, done);
        });

        it('should add the action attribute with value "create" to the request', testAction('create', options));
    });

    describe('When a update action arrives with JSON payload', function() {
        var options = {
            uri: 'http://localhost:' + config.resource.proxy.port + '/NGSI10/updateContext',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'fiware-service': 'SmartValencia',
                'fiware-servicepath': 'Electricidad',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
            },
            json: utils.readExampleFile('./test/orionRequests/entityUpdate.json')
        };

        beforeEach(function(done) {
            serverMocks.mockPath('/NGSI10/queryContext', mockApp, done);
        });

        it('should add the action attribute with value "update" to the request', testAction('update', options));
    });
    describe('When a delete action arrives with JSON payload', function() {
        var options = {
            uri: 'http://localhost:' + config.resource.proxy.port + '/NGSI10/updateContext',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'fiware-service': 'SmartValencia',
                'fiware-servicepath': 'Electricidad',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
            },
            json: utils.readExampleFile('./test/orionRequests/entityDelete.json')
        };

        beforeEach(function(done) {
            serverMocks.mockPath('/NGSI10/queryContext', mockApp, done);
        });

        it('should add the action attribute with value "delete" to the request', testAction('delete', options));
    });
    describe('When a delete action arrives with JSON payload', function() {
        var options = {
            uri: 'http://localhost:' + config.resource.proxy.port + '/v1/updateContext?details=on&limit=15&offset=0',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'fiware-service': 'SmartValencia',
                'fiware-servicepath': 'Electricidad',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
            },
            json: utils.readExampleFile('./test/orionRequests/entityDelete.json')
        };

        beforeEach(function(done) {
            serverMocks.mockPath('/NGSI10/queryContext', mockApp, done);
        });

        it('should add the action attribute with value "delete" to the request', testAction('delete', options));
    });
    describe('When a create action arrives with XML payload', function() {
        var options = {
            uri: 'http://localhost:' + config.resource.proxy.port + '/NGSI10/updateContext',
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml',
                'Accept': 'application/xml',
                'fiware-service': 'SmartValencia',
                'fiware-servicepath': 'Electricidad',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
            },
            body: utils.readExampleFile('./test/orionRequests/entityCreation.xml', true)
        };

        beforeEach(function(done) {
            serverMocks.mockPath('/NGSI10/queryContext', mockApp, done);
        });

        it('should add the action attribute with value "create" to the request', testAction('create', options));
    });

    describe('When a update action arrives with XML payload', function() {
        var options = {
            uri: 'http://localhost:' + config.resource.proxy.port + '/NGSI10/updateContext',
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml',
                'Accept': 'application/xml',
                'fiware-service': 'SmartValencia',
                'fiware-servicepath': 'Electricidad',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
            },
            body: utils.readExampleFile('./test/orionRequests/entityUpdate.xml', true)
        };

        beforeEach(function(done) {
            serverMocks.mockPath('/NGSI10/queryContext', mockApp, done);
        });

        it('should add the action attribute with value "update" to the request', testAction('update', options));
    });
    describe('When a delete action arrives with XML payload', function() {
        var options = {
            uri: 'http://localhost:' + config.resource.proxy.port + '/NGSI10/updateContext',
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml',
                'Accept': 'application/xml',
                'fiware-service': 'SmartValencia',
                'fiware-servicepath': 'Electricidad',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
            },
            body: utils.readExampleFile('./test/orionRequests/entityDelete.xml', true)
        };

        beforeEach(function(done) {
            serverMocks.mockPath('/NGSI10/queryContext', mockApp, done);
        });

        it('should add the action attribute with value "delete" to the request', testAction('delete', options));
    });

    describe('When a update action arrives with JSON payload without the \'updateAction\' attribute', function() {
        var options = {
            uri: 'http://localhost:' + config.resource.proxy.port + '/NGSI10/updateContext',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'fiware-service': 'SmartValencia',
                'fiware-servicepath': 'Electricidad',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
            },
            json: utils.readExampleFile('./test/orionErrorRequests/entityUpdateNoAttribute.json')
        };

        beforeEach(function(done) {
            serverMocks.mockPath('/NGSI10/queryContext', mockApp, done);
        });

        it('should reject the request with an Unauthorized code', function(done) {
            request(options, function(error, response, body) {
                response.statusCode.should.equal(400
                );
                done();
            });
        });
    });

    describe('When a update action arrives with XML payload without the \'updateAction\' attribute', function() {
        var options = {
            uri: 'http://localhost:' + config.resource.proxy.port + '/NGSI10/updateContext',
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml',
                'Accept': 'application/xml',
                'fiware-service': 'SmartValencia',
                'fiware-servicepath': 'Electricidad',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
            },
            body: utils.readExampleFile('./test/orionErrorRequests/entityUpdateNoAttribute.xml', true)
        };

        beforeEach(function(done) {
            serverMocks.mockPath('/NGSI10/queryContext', mockApp, done);
        });

        it('should reject the request with an Unauthorized code', function(done) {
            request(options, function(error, response, body) {
                response.statusCode.should.equal(400);
                done();
            });
        });
    });

    describe('When a update action arrives with a URL that it\'s not recognized by the system', function() {
        var options = {
            uri: 'http://localhost:' + config.resource.proxy.port + '/NGSI10/falsePath',
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml',
                'Accept': 'application/xml',
                'fiware-service': 'SmartValencia',
                'fiware-servicepath': 'Electricidad',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
            },
            body: utils.readExampleFile('./test/orionRequests/entityUpdate.xml', true)
        };

        beforeEach(function(done) {
            serverMocks.mockPath('/NGSI10/queryContext', mockApp, done);
        });

        it('should reject the request with a 400 Bad Request code', function(done) {
            request(options, function(error, response, body) {
                response.statusCode.should.equal(400);
                done();
            });
        });
    });

    describe('When an update action comes with an unknown action in a JSON format', function() {
        var options = {
            uri: 'http://localhost:' + config.resource.proxy.port + '/NGSI10/updateContext',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'fiware-service': 'SmartValencia',
                'fiware-servicepath': 'Electricidad',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
            },
            json: utils.readExampleFile('./test/orionErrorRequests/entityUnknownOperation.json')
        };

        beforeEach(function(done) {
            serverMocks.mockPath('/NGSI10/queryContext', mockApp, done);
        });

        it('should reject the request with a 400', function(done) {
            request(options, function(error, response, body) {
                response.statusCode.should.equal(400);
                done();
            });
        });
    });
    describe('When an update action comes with an unknown action in an XML format', function() {
        var options = {
            uri: 'http://localhost:' + config.resource.proxy.port + '/NGSI10/updateContext',
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml',
                'Accept': 'application/xml',
                'fiware-service': 'SmartValencia',
                'fiware-servicepath': 'Electricidad',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
            },
            body: utils.readExampleFile('./test/orionErrorRequests/entityUnknownOperation.xml', true)
        };

        beforeEach(function(done) {
            serverMocks.mockPath('/NGSI10/queryContext', mockApp, done);
        });

        it('should reject the request with a 400', function(done) {
            request(options, function(error, response, body) {
                response.statusCode.should.equal(400);
                done();
            });
        });
    });

    describe('When a request arrives with an unknown body type', function() {
        var options = {
            uri: 'http://localhost:' + config.resource.proxy.port + '/NGSI10/updateContext',
            method: 'POST',
            headers: {
                'Content-Type': 'application/csv',
                'Accept': 'application/csv',
                'fiware-service': 'SmartValencia',
                'fiware-servicepath': 'Electricidad',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
            },
            body: utils.readExampleFile('./test/orionErrorRequests/entityUnknownOperation.xml', true)
        };

        beforeEach(function(done) {
            serverMocks.mockPath('/NGSI10/queryContext', mockApp, done);
        });

        it('should reject the request with a 400 error', function(done) {
            request(options, function(error, response, body) {
                response.statusCode.should.equal(400);
                done();
            });
        });
    });

    describe('When a request arrives with an XML body with a wrong syntax', function() {
        var options = {
            uri: 'http://localhost:' + config.resource.proxy.port + '/NGSI10/updateContext',
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml',
                'Accept': 'application/xml',
                'fiware-service': 'SmartValencia',
                'fiware-servicepath': 'Electricidad',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
            },
            body: utils.readExampleFile('./test/orionErrorRequests/entitySyntaxError.xml', true)
        };

        beforeEach(function(done) {
            serverMocks.mockPath('/NGSI10/queryContext', mockApp, done);
        });

        it('should reject the request with a 400 error', function(done) {
            request(options, function(error, response, body) {
                response.statusCode.should.equal(400);
                done();
            });
        });
    });

    describe('When a request arrives with a JSON body with a wrong syntax', function() {
        var options = {
            uri: 'http://localhost:' + config.resource.proxy.port + '/NGSI10/updateContext',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'fiware-service': 'SmartValencia',
                'fiware-servicepath': 'Electricidad',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
            },
            body: utils.readExampleFile('./test/orionErrorRequests/entitySyntaxError.json', true)
        };

        beforeEach(function(done) {
            serverMocks.mockPath('/NGSI10/queryContext', mockApp, done);
        });

        it('should reject the request with a 400 error', function(done) {
            request(options, function(error, response, body) {
                response.statusCode.should.equal(400);
                done();
            });
        });
    });

    describe('When a request arrives with a valid XML payload to the proxy', function() {
        var options = {
            uri: 'http://localhost:' + config.resource.proxy.port + '/NGSI10/updateContext',
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml',
                'Accept': 'application/xml',
                'fiware-service': 'SmartValencia',
                'fiware-servicepath': 'Electricidad',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
            },
            body: utils.readExampleFile('./test/orionRequests/entityUpdate.xml', true)
        };

        beforeEach(function(done) {
            async.series([
                async.apply(serverMocks.mockPath, '/v3/role_assignments', mockOAuthApp),
                async.apply(serverMocks.mockPath, '/v3/auth/tokens', mockOAuthApp),
                async.apply(serverMocks.mockPath, '/v3/projects', mockOAuthApp),
                async.apply(serverMocks.mockPath, '/pdp/v3', mockAccessApp),
                async.apply(serverMocks.mockPath, '/NGSI10/updateContext', mockApp)
            ], done);
        });

        it('should proxy the request to the target URL', function(done) {
            var mockExecuted = false;

            mockApp.handler = function(req, res) {
                req.rawBody.replace(/\n/g, '').should.match(/<updateContextRequest>.*<\/updateContextRequest>/);
                mockExecuted = true;
                res.json(200, {});
            };

            request(options, function(error, response, body) {
                mockExecuted.should.equal(true);
                done();
            });
        });
    });


    describe('When a request arrives with a valid JSON payload to the proxy', function() {
        var options = {
            uri: 'http://localhost:' + config.resource.proxy.port + '/NGSI10/updateContext',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'fiware-service': 'SmartValencia',
                'fiware-servicepath': 'Electricidad',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
            },
            json: utils.readExampleFile('./test/orionRequests/entityCreation.json')
        };

        beforeEach(function(done) {
            async.series([
                async.apply(serverMocks.mockPath, '/v3/role_assignments', mockOAuthApp),
                async.apply(serverMocks.mockPath, '/v3/auth/tokens', mockOAuthApp),
                async.apply(serverMocks.mockPath, '/v3/projects', mockOAuthApp),
                async.apply(serverMocks.mockPath, '/pdp/v3', mockAccessApp),
                async.apply(serverMocks.mockPath, '/NGSI10/updateContext', mockApp)
            ], done);
        });

        it('should proxy the request to the target URL', function(done) {
            var mockExecuted = false;

            mockApp.handler = function(req, res) {
                should.exist(req.body.updateAction);
                req.body.updateAction.should.equal('APPEND');
                mockExecuted = true;
                res.json(200, {});
            };

            request(options, function(error, response, body) {
                mockExecuted.should.equal(true);
                done();
            });
        });
    });
});
