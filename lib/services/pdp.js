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
 * please contact with::[iot_support@tid.es]
 */

'use strict';

var async = require('async'),
    apply = async.apply,
    config = require('../../config'),
    errors = require('../errors'),
    logger = require('logops'),
    constants = require('../constants'),
    fs = require('fs'),
    path = require('path'),
    cacheUtils = require('./cacheUtils');

/**
 * Allowed actions by component and role type
 */
const ACTION_MAP = {
    ORION: {
        CUSTOMER: ['read', 'subscribe', 'discover', 'subscribe-availability'],
        ADMIN: ['read', 'create', 'update', 'delete', 'notify', 'register', 'discover', 'subscribe', 'subscribe-availability']
    },
    PERSEO: {
        CUSTOMER: ['readRule'],
        ADMIN: ['readRule', 'writeRule', 'notify']
    },
    IOTAGENT: {
        CUSTOMER: ['read'],
        ADMIN: ['create', 'delete', 'update', 'read']
    },
    STH: {
        CUSTOMER: ['read'],
        ADMIN: ['create', 'delete', 'update', 'read']
    }
};


/**
 * Helper para cacheo y respuesta
 */
function cacheAndReturn(cacheKey, decision, callback) {
    const finalDecision = decision || 'Invalid';
    cacheUtils.get().data.validation.set(cacheKey, finalDecision);
    callback(null, finalDecision);
}


/**
 * validation request using local PDP implementation
 */
function validationRequest(logger, roles, frn, action, headers, callback) {

    logger.debug('pdp.validation with roles: %j, frn: %j, action: %j and headers %j',
                 roles, frn, action, headers);
    const cacheKey = frn + '#' + action + '#' + roles.map(r => r.name).join('-');

    try {
        // -------------------------------------------------
        // 1. parse FRN -> component, service and subservice
        // -------------------------------------------------
        // Format example
        // fiware:orion:smartcity:/tourism:::
        const frnParts = frn.split(':');

        if (frnParts.length < 4) {
            return callback(new Error('Invalid FRN format'));
        }

        const component = frnParts[1].toUpperCase();                  // ORION, PERSEO, IOTA, STH
        const service = frnParts[2];                                  // "smartcity"
        const subserviceRaw = frnParts[3];                            // "/tourism", "///", etc
        const subservice = subserviceRaw.replace(/\//g, '') || null;  // "tourism" o null

        const isServiceOperation = subservice === null;
        const isSubserviceOperation = subservice !== null;

        // --------------------------------------------
        // 2. For each role: get roleType and component
        // --------------------------------------------
        let matchedRole = null;

        for (const role of roles) {
            const name = role.name || '';
            const parts = name.split('#');
            if (parts.length !== 2) continue;

            const roleInfo = parts[1];

            // Try extrat type and component (i.e.: ServiceCustomerORION)
            let match = roleInfo.match(
                /(ServiceCustomer|ServiceAdmin|SubServiceCustomer|SubServiceAdmin)([A-Z]+)$/i
            );

            let roleType, roleComponent;

            // Case 1: rol includes component
            if (match) {
                roleType = match[1];
                roleComponent = match[2].toUpperCase();
            }
            // Caso 2: rol does NOT includes component -> apply over all components
            else {
                match = roleInfo.match(
                    /^(ServiceCustomer|ServiceAdmin|SubServiceCustomer|SubServiceAdmin)$/i
                );
                if (!match) continue;

                roleType = match[1];
                roleComponent = "ANY";
            }

            // 1) Component matches (or ANY)
            if (roleComponent !== "ANY" && roleComponent !== component) continue;

            // 2) Matches at service/subservice level
            const roleIsService = roleType.startsWith('Service');
            const roleIsSubservice = roleType.startsWith('SubService');

            if (isServiceOperation && !roleIsService) continue;
            if (isSubserviceOperation && !roleIsSubservice) continue;

            matchedRole = { roleType, roleComponent };
            break;
        }

        if (!matchedRole) {
            cacheAndReturn(cacheKey, 'Deny', callback);
            return;
        }

        // -----------------
        // 3. Final decision
        // -----------------
        const { roleType } = matchedRole;
        const ROLE_CLASS = roleType.endsWith('Customer') ? 'CUSTOMER' : 'ADMIN';

        const allowedActions =
            ACTION_MAP[component] &&
            ACTION_MAP[component][ROLE_CLASS]
                ? ACTION_MAP[component][ROLE_CLASS]
                : [];

        const decision = allowedActions.includes(action) ? 'Permit' : 'Deny';

        cacheAndReturn(cacheKey, decision, callback);

    } catch (err) {
        logger.error('Validation exception', err);
        callback(err);
    }
}


exports.validationRequest = validationRequest;
