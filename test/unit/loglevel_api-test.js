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

var should = require('should'),
    proxyLib = require('../../lib/fiware-pep-steelskin'),
    config = require('../../config'),
    request = require('request'),
    logger = require('logops');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

describe('Log Level API', function() {
    var proxy;

    beforeEach(function(done) {
        logger.setLevel('FATAL');

        proxyLib.start(function(error, proxyObj) {
            proxy = proxyObj;
            done();
        });
    });

    afterEach(function(done) {
        logger.setLevel('FATAL');

        config.ssl.active = false;
        proxyLib.stop(proxy, done);
    });

    describe('When a new valid log level request comes to the API', function() {
        var options = {
            uri: 'http://127.0.0.1:' + config.resource.proxy.adminPort + '/admin/log',
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            qs: {
                level: 'ERROR'
            }
        };

        it('the real log level should be changed', function(done) {
            request(options, function(error, response, body) {
                should.not.exist(error);
                response.statusCode.should.equal(200);

                done();
            });
        });
    });

    describe('When the current log level is requested through the API', function() {
        var options = {
            uri: 'http://127.0.0.1:' + config.resource.proxy.adminPort + '/admin/log',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        it('should return a 200 OK', function(done) {
            request(options, function(error, response, body) {
                should.not.exist(error);
                response.statusCode.should.equal(200);

                done();
            });
        });

        it('should return the current log level', function(done) {
            request(options, function(error, response, body) {
                var parsedBody = JSON.parse(body);

                should.exist(parsedBody.level);
                parsedBody.level.should.equal('FATAL');

                done();
            });
        });
    });

    describe('When a new log level request comes to the API with an invalid level', function() {
        var options = {
            uri: 'http://127.0.0.1:' + config.resource.proxy.adminPort + '/admin/log',
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            qs: {
                level: 'ALLRIGHT'
            }
        };

        it('should return a 400 error indicating the log level is not valid', function(done) {
            request(options, function(error, response, body) {
                var parsedBody;

                should.not.exist(error);
                response.statusCode.should.equal(400);
                should.exist(body);

                parsedBody = JSON.parse(body);

                parsedBody.error.should.equal('invalid log level');

                done();
            });
        });
    });

    describe('When a new log level request comes to the API without a log level', function() {
        var options = {
            uri: 'http://127.0.0.1:' + config.resource.proxy.adminPort + '/admin/log',
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        it('should return a 400 error indicating the log level is missing', function(done) {
            request(options, function(error, response, body) {
                var parsedBody;

                should.not.exist(error);
                response.statusCode.should.equal(400);
                should.exist(body);

                parsedBody = JSON.parse(body);

                parsedBody.error.should.equal('log level missing');

                done();
            });
        });
    });
});
