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
 * You should have received a copy of the GNU Affero General Public License
 * along with fiware-pep-steelskin.
 * If not, see http://www.gnu.org/licenses/.
 */
'use strict';

const should = require('should');
const proxyquire = require('proxyquire').noCallThru();

// ----------------------------------------------------
// Mocks
// ----------------------------------------------------
const loggerMock = {
    debug: function () {},
    error: function () {}
};

let cacheSetSpy;

const cacheUtilsMock = {
    get: function () {
        return {
            data: {
                validation: {
                    set: function (key, value) {
                        cacheSetSpy(key, value);
                    }
                }
            }
        };
    }
};

// ----------------------------------------------------
// Load PDP module with mocked cacheUtils
// ----------------------------------------------------
const pdp = proxyquire(
    '../../lib/services/pdp',
    {
        './cacheUtils': cacheUtilsMock
    }
);

const validationRequest = pdp.validationRequest;

// ----------------------------------------------------
// Helper: execute validationRequest
// ----------------------------------------------------
function runValidation(params) {
    return new Promise(function (resolve, reject) {
        validationRequest(
            loggerMock,
            params.roles,
            params.frn,
            params.action,
            {},
            function (err, decision) {
                if (err) {
                    reject(err);
                } else {
                    resolve(decision);
                }
            }
        );
    });
}

// ----------------------------------------------------
// Tests
// ----------------------------------------------------
describe('Local PDP validationRequest decision tree', function () {

    beforeEach(function () {
        cacheSetSpy = function () {};
    });

    // ------------------------
    // Valid scenarios
    // ------------------------

    it('ServiceCustomer without component can READ ORION at service level', function (done) {
        runValidation({
            roles: [{ id: '1', name: 'x#ServiceCustomer' }],
            frn: 'fiware:orion:smartcity:/:::',
            action: 'read'
        })
        .then(function (decision) {
            decision.should.equal('Permit');
            done();
        })
        .catch(done);
    });

    it('ServiceCustomer without component cannot CREATE in ORION', function (done) {
        runValidation({
            roles: [{ id: '1', name: 'x#ServiceCustomer' }],
            frn: 'fiware:orion:smartcity:/:::',
            action: 'create'
        })
        .then(function (decision) {
            decision.should.equal('Deny');
            done();
        })
        .catch(done);
    });

    it('ServiceAdminORION can DELETE in ORION', function (done) {
        runValidation({
            roles: [{ id: '1', name: 'x#ServiceAdminORION' }],
            frn: 'fiware:orion:smartcity:/:::',
            action: 'delete'
        })
        .then(function (decision) {
            decision.should.equal('Permit');
            done();
        })
        .catch(done);
    });

    it('ServiceAdminORION cannot operate on PERSEO', function (done) {
        runValidation({
            roles: [{ id: '1', name: 'x#ServiceAdminORION' }],
            frn: 'fiware:perseo:smartcity:/:::',
            action: 'readRule'
        })
        .then(function (decision) {
            decision.should.equal('Deny');
            done();
        })
        .catch(done);
    });

    it('SubServiceCustomer can READ ORION at subservice level', function (done) {
        runValidation({
            roles: [{ id: '1', name: 'x#SubServiceCustomer' }],
            frn: 'fiware:orion:smartcity:/tourism:::',
            action: 'read'
        })
        .then(function (decision) {
            decision.should.equal('Permit');
            done();
        })
        .catch(done);
    });

    it('ServiceCustomer cannot access subservice resources', function (done) {
        runValidation({
            roles: [{ id: '1', name: 'x#ServiceCustomer' }],
            frn: 'fiware:orion:smartcity:/tourism:::',
            action: 'read'
        })
        .then(function (decision) {
            decision.should.equal('Deny');
            done();
        })
        .catch(done);
    });

    it('SubServiceAdminIOTAGENT can UPDATE IOTAGENT at subservice level', function (done) {
        runValidation({
            roles: [{ id: '1', name: 'x#SubServiceAdminIOTAGENT' }],
            frn: 'fiware:iotagent:smartcity:/devices:::',
            action: 'update'
        })
        .then(function (decision) {
            decision.should.equal('Permit');
            done();
        })
        .catch(done);
    });

    it('ServiceCustomer (ANY) can READ STH', function (done) {
        runValidation({
            roles: [{ id: '1', name: 'x#ServiceCustomer' }],
            frn: 'fiware:sth:smartcity:/:::',
            action: 'read'
        })
        .then(function (decision) {
            decision.should.equal('Permit');
            done();
        })
        .catch(done);
    });

    // ------------------------
    // Edge cases
    // ------------------------

    it('Invalid FRN format should return an error', function (done) {
        runValidation({
            roles: [{ id: '1', name: 'x#ServiceCustomer' }],
            frn: 'invalid-frn',
            action: 'read'
        })
        .then(function () {
            done(new Error('Expected error was not thrown'));
        })
        .catch(function (err) {
            err.message.should.equal('Invalid FRN format');
            done();
        });
    });

    it('Role with invalid format should be ignored and result in Deny', function (done) {
        runValidation({
            roles: [{ id: '1', name: 'INVALID_ROLE_NAME' }],
            frn: 'fiware:orion:smartcity:/:::',
            action: 'read'
        })
        .then(function (decision) {
            decision.should.equal('Deny');
            done();
        })
        .catch(done);
    });

    it('Unknown role type should result in Deny', function (done) {
        runValidation({
            roles: [{ id: '1', name: 'x#SuperAdminORION' }],
            frn: 'fiware:orion:smartcity:/:::',
            action: 'read'
        })
        .then(function (decision) {
            decision.should.equal('Deny');
            done();
        })
        .catch(done);
    });

    it('Unknown action should result in Deny', function (done) {
        runValidation({
            roles: [{ id: '1', name: 'x#ServiceAdminORION' }],
            frn: 'fiware:orion:smartcity:/:::',
            action: 'fly'
        })
        .then(function (decision) {
            decision.should.equal('Deny');
            done();
        })
        .catch(done);
    });

    it('No roles provided should result in Deny', function (done) {
        runValidation({
            roles: [],
            frn: 'fiware:orion:smartcity:/:::',
            action: 'read'
        })
        .then(function (decision) {
            decision.should.equal('Deny');
            done();
        })
        .catch(done);
    });

});
