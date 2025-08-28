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
    restPlugin = require('../../lib/plugins/restPlugin'),
    keystonePlugin = require('../../lib/services/keystoneAuth'),
    cacheUtils = require('../../lib/services/cacheUtils'),
    config = require('../../config'),
    utils = require('../tools/utils'),
    should = require('should'),
    async = require('async'),
    request = require('request');

describe('IOT Agent Plugin tests', function() {
    var proxy,
        mockServer,
        mockApp,
        mockAccess,
        mockAccessApp,
        mockOAuth,
        mockOAuthApp,
        apiCases = [
            ['POST', '/iot/devices', 'create'],
            ['GET', '/iot/devices', 'read'],
            ['GET', '/iot/devices/aDevice', 'read'],
            ['DELETE', '/iot/devices/aDevice', 'delete'],
            ['PUT', '/iot/devices/aDevice', 'update'],

            ['POST', '/iot/agents/defaultIoTAgent/services', 'create'],
            ['GET', '/iot/agents/defaultIoTAgent/services', 'read'],
            ['PUT', '/iot/agents/defaultIoTAgent/services', 'update'],
            ['DELETE', '/iot/agents/defaultIoTAgent/services', 'delete']
        ];

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

        describe('When a ' + particularCase[0] + ' request arrives to the ' +
        particularCase[1] + ' url of the IOT Agent through the PEP Proxy', function() {

            beforeEach(function(done) {
                config.middlewares.require = 'lib/services/restPlugin';
                config.middlewares.function = [
                    'extractAction'
                ];

                cacheUtils.clean();
                keystonePlugin.invalidate();

                proxyLib.start(function(error, proxyObj) {
                    proxy = proxyObj;

                    proxy.middlewares.push(restPlugin.extractAction);

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
                                    res.status(200).json(
                                        utils.readExampleFile('./test/authorizationResponses/rolesOfUser.json'));
                                };

                                async.series([
                                    async.apply(serverMocks.mockPath, '/user', mockOAuthApp),
                                    async.apply(serverMocks.mockPath, '/v3/auth/tokens', mockOAuthApp),
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
});
