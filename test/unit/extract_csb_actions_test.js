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

describe('Extract Context Broker action from request', function() {
    describe('When a create action arrives', function () {
        it('should add the action attribute with value "create" to the request');
    });
    describe('When a update action arrives', function () {
        it('should add the action attribute with value "update" to the request');
    });
    describe('When a delete action arrives', function () {
        it('should add the action attribute with value "delete" to the request');
    });
    describe('When a read action arrives', function () {
        it('should add the action attribute with value "read" to the request');
    });
    describe('When a subscribe action arrives', function () {
        it('should add the action attribute with value "subscribe" to the request');
    });
    describe('When a register action arrives', function () {
        it('should add the action attribute with value "register" to the request');
    });
    describe('When a discover action arrives', function () {
        it('should add the action attribute with value "discover" to the request');
    });
    describe('When a subscribe-availability action arrives', function () {
        it('should add the action attribute with value "subscribe-availability" to the request');
    });
});