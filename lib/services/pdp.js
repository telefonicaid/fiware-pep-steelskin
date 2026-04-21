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

var cacheUtils = require('./cacheUtils');

/**
 * Allowed actions by component and role type
 */
const ACTION_MAP = {
    ORION: {
        CUSTOMER: ['read', 'subscribe', 'discover', 'subscribe-availability'],
        ADMIN: ['read', 'create', 'update', 'delete', 'notify', 'register',
                'discover', 'subscribe', 'subscribe-availability']
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
 * Helper for caching and response
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
        // 1. parse FRN -> component, service and subservice
        // Format example: fiware:orion:smartcity:/tourism:::
        const frnParts = frn.split(':');

        if (frnParts.length < 4) {
            return callback(new Error('Invalid FRN format'));
        }

        const component = frnParts[1].toUpperCase();                  // ORION, PERSEO, IOTAGENT, STH
        const subserviceRaw = frnParts[3];                            // "/tourism", "/", etc
        const subservice = subserviceRaw.replace(/\//g, '') || null;  // "tourism" o null

        const isServiceOperation = subservice === null;
        const isSubserviceOperation = subservice !== null;

        // 2. For each role: get roleType and component
        let hasMatchingRole = false;
        let isPermitted = false;

        for (const role of roles) {
            const name = (role.name || '').trim();

            // if name role with '#', then get right part; otherwise name as is
            const hashParts = name.split('#');
            const roleInfoRaw = (hashParts.length === 2 ? hashParts[1] : hashParts[0]).trim();

            // Alias: admin (without #) = ServiceAdmin for all components
            const roleInfo = /^admin$/i.test(roleInfoRaw) ? 'ServiceAdmin' : roleInfoRaw;

            // Try extract type and component (i.e.: ServiceCustomerORION)
            let match = roleInfo.match(
                /^(ServiceCustomer|ServiceAdmin|SubServiceCustomer|SubServiceAdmin)([A-Z]+)$/i
            );

            let roleType;
            let roleComponent;

            // Case 1: role includes component
            if (match) {
                roleType = match[1];
                roleComponent = match[2].toUpperCase();
            }
            // Case 2: role does NOT include component -> apply over all components
            else {
                match = roleInfo.match(
                    /^(ServiceCustomer|ServiceAdmin|SubServiceCustomer|SubServiceAdmin)$/i
                );

                if (!match) {
                    continue;
                }

                roleType = match[1];
                roleComponent = 'ANY';
            }

            // 1) Component matches (or ANY)
            if (roleComponent !== 'ANY' && roleComponent !== component) {
                continue;
            }

            // 2) Matches at service/subservice level
            const roleIsService = roleType.startsWith('Service');
            const roleIsSubservice = roleType.startsWith('SubService');

            if (isServiceOperation && !roleIsService) {
                continue;
            }
            if (isSubserviceOperation && !roleIsSubservice) {
                continue;
            }

            hasMatchingRole = true;

            // 3) Check whether THIS role permits the action
            const ROLE_CLASS = roleType.endsWith('Customer') ? 'CUSTOMER' : 'ADMIN';
            const allowedActions =
                (ACTION_MAP[component] && ACTION_MAP[component][ROLE_CLASS]) || [];

            if (allowedActions.includes(action)) {
                isPermitted = true;
                break; // one permitting role is enough
            }
        }

        const decision = (hasMatchingRole && isPermitted) ? 'Permit' : 'Deny';
        cacheAndReturn(cacheKey, decision, callback);

    } catch (err) {
        logger.error('Validation exception', err);
        callback(err);
    }
}

exports.validationRequest = validationRequest;
