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
    config = require('../../config'),
    utils = require('../tools/utils'),
    should = require('should'),
    request = require('request');


describe('Extract information from requests', function() {
    var proxy,
        mockServer,
        mockApp;

    beforeEach(function (done) {
        proxyLib.start(function (error, proxyObj) {
            proxy = proxyObj;

            serverMocks.start(config.resource.original.port, function (error, server, app) {
                mockServer = server;
                mockApp = app;
                done();
            });
        });
    });

    afterEach(function (done) {
        proxyLib.stop(proxy, function(error) {
            serverMocks.stop(mockServer, done);
        });
    });

    describe('When a request to the CSB arrives to the proxy with all the information', function () {
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

        beforeEach(function (done) {
            serverMocks.mockPath('/NGSI10/updateContext', mockApp, done);
        });

        it('should extract the organization to an attribute in the request', function (done) {
            var extractionExecuted = false;

            var testExtraction = function (req, res, callback) {
                should.exist(req.organization);
                req.organization.should.equal('frn:contextbroker:551:::');
                extractionExecuted = true;
                callback(null, req, res);
            };

            proxy.middlewares.push(testExtraction);

            request(options, function (error, response, body) {
                extractionExecuted.should.equal(true);
                done();
            });
        });
        it('should guess the action looking to the URL and the body an add it to an attribute in the request');
        it('should extract the user token to an attribute in the request', function (done) {
            var extractionExecuted = false;

            var testExtraction = function (req, res, callback) {
                should.exist(req.userId);
                req.userId.should.equal('UAidNA9uQJiIVYSCg0IQ8Q');
                extractionExecuted = true;
                callback(null, req, res);
            };

            proxy.middlewares.push(testExtraction);

            request(options, function (error, response, body) {
                extractionExecuted.should.equal(true);
                done();
            });
        });
        it('should proxy the request to the target URL');
    });

    describe('When a request arrives to the CSB without a user token', function () {
        it ('should reject the request with a 401 error code');
    });
});
