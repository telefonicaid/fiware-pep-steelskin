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
    perseoPlugin = require('../../lib/plugins/perseoPlugin'),
    config = require('../../config'),
    utils = require('../tools/utils'),
    should = require('should'),
    async = require('async'),
    request = require('request');

describe('Perseo Plugin tests', function() {
    var proxy,
        mockServer,
        mockApp,
        mockAccess,
        mockAccessApp,
        mockOAuth,
        mockOAuthApp,
        apiCases = [
            ['POST', '/notices', 'notify'],

            ['GET', '/rules', 'readRule'],
            ['GET', '/rules/1346', 'readRule'],
            ['POST', '/rules', 'writeRule'],
            ['DELETE', '/rules/134', 'writeRule'],
            ['GET', '/m2m/vrules', 'readRule'],
            ['GET', '/m2m/vrules/134', 'readRule'],
            ['POST', '/m2m/vrules', 'writeRule'],
            ['DELETE', '/m2m/vrules/134', 'writeRule'],
            ['PUT', '/m2m/vrules/134', 'writeRule']
        ];

    function apiCase(particularCase) {
        var options = {
            uri: 'http://localhost:' + config.resource.proxy.port + particularCase[1],
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
        describe('When a ' + particularCase[0] + ' request arrives to the ' +
            particularCase[1] + ' url of the CEP through the PEP Proxy', function() {

            beforeEach(function(done) {
                config.middlewares.require = 'lib/services/perseoPlugin';
                config.middlewares.function = [
                    'extractAction'
                ];

                proxyLib.start(function(error, proxyObj) {
                    proxy = proxyObj;

                    proxy.middlewares.push(perseoPlugin.extractAction);

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
