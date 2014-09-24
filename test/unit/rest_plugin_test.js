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
    restPlugin = require('../../lib/services/restPlugin'),
    config = require('../../config'),
    utils = require('../tools/utils'),
    should = require('should'),
    async = require('async'),
    request = require('request');

describe('REST Plugin tests', function() {
    var proxy,
        mockServer,
        mockApp,
        mockAccess,
        mockAccessApp,
        mockOAuth,
        mockOAuthApp,
        apiCases = [
        ['POST', 'create'],
        ['PUT', 'update'],
        ['DELETE', 'delete'],
        ['GET', 'read']
    ];

    function apiCase(particularCase) {
        var options = {
            uri: 'http://localhost:' + config.resource.proxy.port + '/generalResource',
            method: particularCase[0],
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Fiware-Service': 'frn:contextbroker:551:::',
                'fiware-servicepath': '833',
                'X-Auth-Token': 'UAidNA9uQJiIVYSCg0IQ8Q'
            },
            json: {}
        };

        describe('When  a ' + particularCase[0] + ' request arrives to the PEP Proxy', function() {
            beforeEach(function(done) {
                config.middlewares.require = 'lib/services/restPlugin';
                config.middlewares.function = [
                    'extractAction'
                ];

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

                            serverMocks.start(config.authentication.port, function(error, serverAuth, appAuth) {
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

            it('should mark the action as "' + particularCase[1] + '"', function(done) {
                var extractionExecuted = false;

                var testExtraction = function(req, res, callback) {
                    should.exist(req.action);
                    req.action.should.equal(particularCase[1]);
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
