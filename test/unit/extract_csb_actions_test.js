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
    config = require('../../config'),
    utils = require('../tools/utils'),
    should = require('should'),
    request = require('request');


describe('Extract Context Broker action from request', function() {
    var proxy,
        mockServer,
        mockApp,
        mockAccess,
        mockAccessApp;

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

                    serverMocks.mockPath('/validate', mockAccessApp, done);
                });
            });
        });
    });

    afterEach(function(done) {
        proxyLib.stop(proxy, function(error) {
            serverMocks.stop(mockServer, function() {
                serverMocks.stop(mockAccess, done);
            });
        });
    });

    describe('When a create action arrives with JSON payload', function() {
        var options = {
            uri: 'http://localhost:' + config.resource.proxy.port + '/NGSI10/updateContext',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Fiware-Service': 'frn:contextbroker:551:::',
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
                'Fiware-Service': 'frn:contextbroker:551:::',
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
                'Fiware-Service': 'frn:contextbroker:551:::',
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
                'Fiware-Service': 'frn:contextbroker:551:::',
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
                'Fiware-Service': 'frn:contextbroker:551:::',
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
                'Fiware-Service': 'frn:contextbroker:551:::',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
            },
            body: utils.readExampleFile('./test/orionRequests/entityDelete.xml', true)
        };

        beforeEach(function(done) {
            serverMocks.mockPath('/NGSI10/queryContext', mockApp, done);
        });

        it('should add the action attribute with value "delete" to the request', testAction('delete', options));
    });

    describe('When a read action arrives', function() {
        var options = {
            uri: 'http://localhost:' + config.resource.proxy.port + '/NGSI10/queryContext',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Fiware-Service': 'frn:contextbroker:551:::',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
            },
            json: utils.readExampleFile('./test/orionRequests/queryContext.json')
        };

        beforeEach(function(done) {
            serverMocks.mockPath('/NGSI10/queryContext', mockApp, done);
        });

        it('should add the action attribute with value "read" to the request', testAction('read', options));
    });

    describe('When a subscribe action arrives', function() {
        var options = {
            uri: 'http://localhost:' + config.resource.proxy.port + '/ngsi10/subscribeContext',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Fiware-Service': 'frn:contextbroker:551:::',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
            },
            json: utils.readExampleFile('./test/orionRequests/queryContext.json')
        };

        beforeEach(function(done) {
            serverMocks.mockPath('/ngsi10/subscribeContext', mockApp, done);
        });

        it('should add the action attribute with value "subscribe" to the request', testAction('subscribe', options));
    });
    describe('When a register action arrives', function() {
        var options = {
            uri: 'http://localhost:' + config.resource.proxy.port + '/ngsi9/registerContext',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Fiware-Service': 'frn:contextbroker:551:::',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
            },
            json: utils.readExampleFile('./test/orionRequests/queryContext.json')
        };

        beforeEach(function(done) {
            serverMocks.mockPath('/ngsi9/registerContext', mockApp, done);
        });

        it('should add the action attribute with value "register" to the request', testAction('register', options));
    });
    describe('When a discover action arrives', function() {
        var options = {
            uri: 'http://localhost:' + config.resource.proxy.port + '/nsgi9/discoverContextAvailability',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Fiware-Service': 'frn:contextbroker:551:::',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
            },
            json: utils.readExampleFile('./test/orionRequests/queryContext.json')
        };

        beforeEach(function(done) {
            serverMocks.mockPath('/nsgi9/discoverContextAvailability', mockApp, done);
        });

        it('should add the action attribute with value "discover" to the request', testAction('discover', options));
    });
    describe('When a subscribe-availability action arrives', function() {
        var options = {
            uri: 'http://localhost:' + config.resource.proxy.port + '/ngsi9/subscribeContextAvailability',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Fiware-Service': 'frn:contextbroker:551:::',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
            },
            json: utils.readExampleFile('./test/orionRequests/queryContext.json')
        };

        beforeEach(function(done) {
            serverMocks.mockPath('/ngsi9/subscribeContextAvailability', mockApp, done);
        });

        it('should add the action attribute with value "subscribe-availability" to the request',
            testAction('subscribe-availability', options));
    });

    describe('When a update action arrives with JSON payload without the \'updateAction\' attribute', function() {
        var options = {
            uri: 'http://localhost:' + config.resource.proxy.port + '/NGSI10/updateContext',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Fiware-Service': 'frn:contextbroker:551:::',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
            },
            json: utils.readExampleFile('./test/orionErrorRequests/entityUpdateNoAttribute.json')
        };

        beforeEach(function(done) {
            serverMocks.mockPath('/NGSI10/queryContext', mockApp, done);
        });

        it('should reject the request with an Unauthorized code', function(done) {
            request(options, function(error, response, body) {
                response.statusCode.should.equal(403);
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
                'Fiware-Service': 'frn:contextbroker:551:::',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
            },
            body: utils.readExampleFile('./test/orionErrorRequests/entityUpdateNoAttribute.xml', true)
        };

        beforeEach(function(done) {
            serverMocks.mockPath('/NGSI10/queryContext', mockApp, done);
        });

        it('should reject the request with an Unauthorized code', function(done) {
            request(options, function(error, response, body) {
                response.statusCode.should.equal(403);
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
                'Fiware-Service': 'frn:contextbroker:551:::',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
            },
            body: utils.readExampleFile('./test/orionRequests/entityUpdate.xml', true)
        };

        beforeEach(function(done) {
            serverMocks.mockPath('/NGSI10/queryContext', mockApp, done);
        });

        it('should reject the request with an Unauthorized code', function(done) {
            request(options, function(error, response, body) {
                response.statusCode.should.equal(403);
                done();
            });
        });
    });
});
