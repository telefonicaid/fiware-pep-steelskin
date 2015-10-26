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
    should = require('should'),
    async = require('async'),
    request = require('request'),
    convenienceOperations;

convenienceOperations = [
    /* "Classic" NGSI9 operations */
    ['GET', '/ngsi9/contextEntities/TestedEntityId001', 'discover'],
    ['GET', '/ngsi9/contextEntities/type/TestedType01/id/TestedEntityId001', 'discover'],
    ['POST', '/ngsi9/contextEntities/TestedEntityId001', 'register'],
    ['POST', '/ngsi9/contextEntities/type/TestedType01/id/TestedEntityId001', 'register'],
    ['GET', '/ngsi9/contextEntities/TestedEntityId001/attributes', 'N/A'],
    ['GET', '/ngsi9/contextEntities/type/TestedType01/id/TestedEntityId001/attributes', 'N/A'],
    ['POST', '/ngsi9/contextEntities/TestedEntityId001/attributes', 'N/A'],
    ['POST', '/ngsi9/contextEntities/type/TestedType01/id/TestedEntityId001/attributes', 'N/A'],
    ['GET', '/ngsi9/contextEntities/TestedEntityId001/attributes/TestedAttributeName001', 'discover'],
    ['GET', '/ngsi9/contextEntities/type/TestedType01/id/TestedEntityId001/attributes/TestedAttributeName001',
            'discover'],
    ['POST', '/ngsi9/contextEntities/TestedEntityId001/attributes/TestedAttributeName001', 'register'],
    ['POST', '/ngsi9/contextEntities/type/TestedType01/id/TestedEntityId001/attributes/TestedAttributeName001',
            'register'],
    ['GET', '/ngsi9/contextEntities/TestedEntityId001/attributeDomains/TestedDomainName001', 'discover'],
    ['GET', '/ngsi9/contextEntities/type/TestedType01/id/TestedEntityId001/attributeDomains/TestedDomainName001',
            'discover'],
    ['POST', '/ngsi9/contextEntities/TestedEntityId001/attributeDomains/TestedDomainName001', 'register'],
    ['POST', '/ngsi9/contextEntities/type/TestedType01/id/TestedEntityId001/attributeDomains/TestedDomainName001',
            'register'],
    ['GET', '/ngsi9/contextEntityTypes/TestedTypeName001', 'discover'],
    ['POST', '/ngsi9/contextEntityTypes/TestedTypeName001', 'register'],
    ['GET', '/ngsi9/contextEntityTypes/TestedTypeName001/attributes', 'N/A'],
    ['POST', '/ngsi9/contextEntityTypes/TestedTypeName001/attributes', 'N/A'],
    ['GET', '/ngsi9/contextEntityTypes/TestedTypeName001/attributes/TestedAttributeName001', 'discover'],
    ['POST', '/ngsi9/contextEntityTypes/TestedTypeName001/attributes/TestedAttributeName001', 'register'],
    ['GET', '/ngsi9/contextEntityTypes/TestedTypeName001/attributeDomains/TestedDomainName001', 'discover'],
    ['POST', '/ngsi9/contextEntityTypes/TestedTypeName001/attributeDomains/TestedDomainName001', 'register'],
    ['POST', '/ngsi9/contextAvailabilitySubscriptions', 'subscribe-availability'],
    ['PUT', '/ngsi9/contextAvailabilitySubscriptions/TestedSubscriptionID002', 'subscribe-availability'],
    ['DELETE', '/ngsi9/contextAvailabilitySubscriptions/TestedSubscriptionID002', 'subscribe-availability'],

    /* "Classic" NGSI10 operations */
    ['GET', '/ngsi10/contextEntities/TestedEntityId002', 'read'],
    ['GET', '/ngsi10/contextEntities/type/TestedType01/id/TestedEntityId002', 'read'],
    ['PUT', '/ngsi10/contextEntities/TestedEntityId002', 'update'],
    ['PUT', '/ngsi10/contextEntities/type/TestedType01/id/TestedEntityId002', 'update'],
    ['POST', '/ngsi10/contextEntities/TestedEntityId002', 'create'],
    ['POST', '/ngsi10/contextEntities/type/TestedType01/id/TestedEntityId002', 'create'],
    ['DELETE', '/ngsi10/contextEntities/TestedEntityId002', 'delete'],
    ['DELETE', '/ngsi10/contextEntities/type/TestedType01/id/TestedEntityId002', 'delete'],
    ['GET', '/ngsi10/contextEntities/TestedEntityId002/attributes', 'N/A'],
    ['GET', '/ngsi10/contextEntities/type/TestedType01/id/TestedEntityId002/attributes', 'N/A'],
    ['PUT', '/ngsi10/contextEntities/TestedEntityId002/attributes', 'N/A'],
    ['PUT', '/ngsi10/contextEntities/type/TestedType01/id/TestedEntityId002/attributes', 'N/A'],
    ['POST', '/ngsi10/contextEntities/TestedEntityId002/attributes', 'N/A'],
    ['POST', '/ngsi10/contextEntities/type/TestedType01/id/TestedEntityId002/attributes', 'N/A'],
    ['DELETE', '/ngsi10/contextEntities/TestedEntityId002/attributes', 'N/A'],
    ['DELETE', '/ngsi10/contextEntities/type/TestedType01/id/TestedEntityId002/attributes', 'N/A'],
    ['GET', '/ngsi10/contextEntities/TestedEntityId002/attributes/TestedAttributeName001', 'read'],
    ['GET', '/ngsi10/contextEntities/type/TestedType01/id/TestedEntityId002/attributes/TestedAttributeName001',
            'read'],
    ['POST', '/ngsi10/contextEntities/TestedEntityId002/attributes/TestedAttributeName001', 'create'],
    ['POST', '/ngsi10/contextEntities/type/TestedType01/id/TestedEntityId002/attributes/TestedAttributeName001',
            'create'],
    ['PUT', '/ngsi10/contextEntities/TestedEntityId002/attributes/TestedAttributeName001', 'update'],
    ['PUT', '/ngsi10/contextEntities/type/TestedType01/id/TestedEntityId002/attributes/TestedAttributeName001',
            'update'],
    ['DELETE', '/ngsi10/contextEntities/TestedEntityId002/attributes/TestedAttributeName001', 'delete'],
    ['DELETE', '/ngsi10/contextEntities/type/TestedType01/id/TestedEntityId002/attributes/TestedAttributeName001',
            'delete'],
    ['GET', '/ngsi10/contextEntities/TestedEntityId002/attributes/TestedAttributeName001/TestedValueID001', 'read'],
    ['GET', '/ngsi10/contextEntities/type/TestedType01/id/TestedEntityId002/attributes/TestedAttributeName001' +
            '/TestedValueID001', 'read'],
    ['PUT', '/ngsi10/contextEntities/TestedEntityId002/attributes/TestedAttributeName001/TestedValueID001', 'update'],
    ['PUT', '/ngsi10/contextEntities/type/TestedType01/id/TestedEntityId002/attributes/TestedAttributeName001' +
        '/TestedValueID001', 'update'],
    ['DELETE', '/ngsi10/contextEntities/TestedEntityId002/attributes/TestedAttributeName001/TestedValueID001',
        'delete'],
    ['DELETE', '/ngsi10/contextEntities/type/TestedType01/id/TestedEntityId002/attributes/TestedAttributeName001' +
        '/TestedValueID001', 'delete'],
    ['GET', '/ngsi10/contextEntities/TestedEntityId002/attributeDomains/TestedDomainName001', 'read'],
    ['GET', '/ngsi10/contextEntities/type/TestedType01/id/TestedEntityId002/attributeDomains/TestedDomainName001',
            'read'],
    ['GET', '/ngsi10/contextEntityTypes/TestedTypeName001', 'read'],
    ['GET', '/v1/contextEntities/{EntityID}', 'read'],
    ['GET', '/ngsi10/contextEntityTypes/TestedTypeName001/attributes', 'N/A'],
    ['GET', '/ngsi10/contextEntityTypes/TestedTypeName001/attributes/TestedAttributeName001', 'read'],
    ['GET', '/ngsi10/contextEntityTypes/TestedTypeName001/attributeDomains/TestedDomainName001', 'read'],
    ['POST', '/ngsi10/contextSubscriptions', 'subscribe'],
    ['PUT', '/ngsi10/contextSubscriptions/TestedSubscriptionID001', 'subscribe'],
    ['DELETE', '/ngsi10/contextSubscriptions/TestedSubscriptionID001', 'subscribe'],
    /* Testing a subset of "classic" operations in v1/ prefix (we don't need to be exahustive) */
    ['PUT', '/v1/contextSubscriptions/TestedSubscriptionID001', 'subscribe'],
    ['DELETE', '/v1/contextSubscriptions/TestedSubscriptionID001', 'subscribe'],
    ['PUT', '/v1/contextSubscriptions/TestedSubscriptionID001', 'subscribe'],
    ['GET', '/v1/registry/contextEntityTypes/TestedTypeName001', 'discover'],
    ['POST', '/v1/registry/contextEntityTypes/TestedTypeName001', 'register'],
    /* New operations in v1/ */
    ['GET', '/v1/contextEntities', 'read'],
    ['POST', '/v1/contextEntities', 'create'],
    ['GET', '/v1/contextSubscriptions', 'read'],
    ['GET', '/v1/contextSubscriptions/sub001', 'read'],
    ['GET', '/v1/contextTypes', 'read'],
    ['GET', '/v1/contextTypes/typeOfEntity001', 'read'],

    /* NGSI Operations with query params */
    ['POST', '/v1/registry/contextAvailabilitySubscriptions?details=on&limit=15&offset=0 ',
        'subscribe-availability'],
    ['GET', '/v1/contextSubscriptions?details=on&limit=15&offset=0', 'read'],
    ['POST', '/v1/registry/subscribeContextAvailability?details=on&limit=15&offset=0', 'subscribe-availability'],
    ['POST', '/v1/registry/updateContextAvailabilitySubscription?details=on&limit=15&offset=0',
        'subscribe-availability'],

    /* V2 Operations */
    ['GET', '/v2', 'read'],
    ['GET', '/v2/entities', 'read'],
    ['GET', '/v2/entities?limit=15&offset=0', 'read'],
    ['GET', '/v2/entities/idOfTheEntity', 'read'],
    ['GET', '/v2/entities?type=TheType', 'read'],
    ['GET', '/v2/entities?id=idOfTheEntity', 'read'],
    ['GET', '/v2/entities?idPattern=idOf*', 'read'],
    ['GET', '/v2/entities?q=temperature<24;humidity==75..90;status=running', 'read'],
    ['POST', '/v2/entities', 'create'],
    ['GET', '/v2/entities/idOfTheEntity?attrs=theAttribute', 'read'],
    ['PATCH', '/v2/entities/idOfTheEntity', 'update'],
    //['POST', '/v2/entities/idOfTheEntity', 'update'],
    ['DELETE', '/v2/entities/idOfTheEntity', 'delete'],
    ['PUT', '/v2/entities/idOfTheEntity', 'update'],
    ['GET', '/v2/entities/idOfTheEntity/attrs/theAttribute', 'read'],
    ['PUT', '/v2/entities/idOfTheEntity/attrs/theAttribute', 'update'],
    ['DELETE', '/v2/entities/idOfTheEntity/attrs/theAttribute', 'delete'],
    ['GET', '/v2/entities/idOfTheEntity/attrs/theAttribute/value', 'read'],
    ['PUT', '/v2/entities/idOfTheEntity/attrs/theAttribute/value', 'update'],
    ['GET', '/v2/types', 'read'],
    ['GET', '/v2/types/theType', 'read']
];

describe.only('Extract Context Broker action from convenience operation requests', function() {
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

    function testConvenienceOperation(convenienceUrl, convenienceMethod, convenienceAction) {
        return function() {
            var options = {
                uri: 'http://localhost:' + config.resource.proxy.port + convenienceUrl,
                method: convenienceMethod,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Fiware-Service': 'frn:contextbroker:admin_domain:::',
                    'Fiware-ServicePath': 'admin_domain',
                    'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
                },
                json: utils.readExampleFile('./test/orionRequests/entityCreation.json')
            };

            beforeEach(function(done) {
                serverMocks.mockPath('/NGSI10/queryContext', mockApp, done);
            });

            it('should add the action attribute with value ' + convenienceAction + ' to the request',
                testAction(convenienceAction, options));
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

                        mockOAuthApp.handler = function(req, res) {
                            res.json(200, utils.readExampleFile('./test/authorizationResponses/rolesOfUser.json'));
                        };

                        async.series([
                            async.apply(serverMocks.mockPath, '/v3/auth/tokens', mockOAuthApp),
                            async.apply(serverMocks.mockPath, '/user', mockOAuthApp),
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

    for (var i = 0; i < convenienceOperations.length; i++) {
        describe('When a request arrives with a convenience operation URL ' +
            convenienceOperations[i][1] + ' ' + convenienceOperations[i][0],
            testConvenienceOperation(convenienceOperations[i][1],
                convenienceOperations[i][0],
                convenienceOperations[i][2]));
    }
});
