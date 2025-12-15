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
function runValidation({ roles, frn, action }) {
    return new Promise((resolve, reject) => {
        validationRequest(
            loggerMock,
            roles,
            frn,
            action,
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

    it('ServiceCustomer without component can READ ORION at service level', async function () {
        const decision = await runValidation({
            roles: [{ id: '1', name: 'x#ServiceCustomer' }],
            frn: 'fiware:orion:smartcity:/:::',
            action: 'read'
        });

        decision.should.equal('Permit');
    });

    it('ServiceCustomer without component cannot CREATE in ORION', async function () {
        const decision = await runValidation({
            roles: [{ id: '1', name: 'x#ServiceCustomer' }],
            frn: 'fiware:orion:smartcity:/:::',
            action: 'create'
        });

        decision.should.equal('Deny');
    });

    it('ServiceAdminORION can DELETE in ORION', async function () {
        const decision = await runValidation({
            roles: [{ id: '1', name: 'x#ServiceAdminORION' }],
            frn: 'fiware:orion:smartcity:/:::',
            action: 'delete'
        });

        decision.should.equal('Permit');
    });

    it('ServiceAdminORION cannot operate on PERSEO', async function () {
        const decision = await runValidation({
            roles: [{ id: '1', name: 'x#ServiceAdminORION' }],
            frn: 'fiware:perseo:smartcity:/:::',
            action: 'readRule'
        });

        decision.should.equal('Deny');
    });

    it('SubServiceCustomer can READ ORION at subservice level', async function () {
        const decision = await runValidation({
            roles: [{ id: '1', name: 'x#SubServiceCustomer' }],
            frn: 'fiware:orion:smartcity:/tourism:::',
            action: 'read'
        });

        decision.should.equal('Permit');
    });

    it('ServiceCustomer cannot access subservice resources', async function () {
        const decision = await runValidation({
            roles: [{ id: '1', name: 'x#ServiceCustomer' }],
            frn: 'fiware:orion:smartcity:/tourism:::',
            action: 'read'
        });

        decision.should.equal('Deny');
    });

    it('SubServiceAdminIOTAGENT can UPDATE IOTAGENT at subservice level', async function () {
        const decision = await runValidation({
            roles: [{ id: '1', name: 'x#SubServiceAdminIOTAGENT' }],
            frn: 'fiware:iotagent:smartcity:/devices:::',
            action: 'update'
        });

        decision.should.equal('Permit');
    });

    it('ServiceCustomer (ANY) can READ STH', async function () {
        const decision = await runValidation({
            roles: [{ id: '1', name: 'x#ServiceCustomer' }],
            frn: 'fiware:sth:smartcity:/:::',
            action: 'read'
        });

        decision.should.equal('Permit');
    });

    // ------------------------
    // Edge cases
    // ------------------------

    it('Invalid FRN format should return an error', async function () {
        try {
            await runValidation({
                roles: [{ id: '1', name: 'x#ServiceCustomer' }],
                frn: 'invalid-frn',
                action: 'read'
            });
            should.fail('Expected an error to be thrown');
        } catch (err) {
            err.message.should.equal('Invalid FRN format');
        }
    });

    it('Role with invalid format should be ignored and result in Deny', async function () {
        const decision = await runValidation({
            roles: [{ id: '1', name: 'INVALID_ROLE_NAME' }],
            frn: 'fiware:orion:smartcity:/:::',
            action: 'read'
        });

        decision.should.equal('Deny');
    });

    it('Unknown role type should result in Deny', async function () {
        const decision = await runValidation({
            roles: [{ id: '1', name: 'x#SuperAdminORION' }],
            frn: 'fiware:orion:smartcity:/:::',
            action: 'read'
        });

        decision.should.equal('Deny');
    });

    it('Unknown action should result in Deny', async function () {
        const decision = await runValidation({
            roles: [{ id: '1', name: 'x#ServiceAdminORION' }],
            frn: 'fiware:orion:smartcity:/:::',
            action: 'fly'
        });

        decision.should.equal('Deny');
    });

    it('No roles provided should result in Deny', async function () {
        const decision = await runValidation({
            roles: [],
            frn: 'fiware:orion:smartcity:/:::',
            action: 'read'
        });

        decision.should.equal('Deny');
    });

});
