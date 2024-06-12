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

/**
 * Operation identification table. Each row of the table contains a Context Broker operation with three fields:
 * the method of the operation, a regular expression to identify the URL, and the action that operation should be
 * assigned.
 *
 * The fourth field (which is optional) is used to match with the URL query parameters of the operation. Note that
 * if two rows are equal in method and URL one with query parameters and the other without them, then the row
 * with the query parameters must be *before* in the table (otherwise the checking in orionPlugin which uses
 * this table will fail).
 */
module.exports = [
    /* V2 Operations */
    ['POST', /^\/v2\/op\/query$/, 'read'],
    ['GET', /^\/v2$/, 'read'],
    ['GET', /^\/v2\/entities$/, 'read'],
    ['GET', /^\/v2\/entities\/.+/, 'read'],
    ['GET', /^\/v2\/entities\/.+\/attrs$/, 'read'],
    ['POST', /^\/v2\/entities$/, 'create'],
    ['PATCH', /^\/v2\/entities\/.+\/attrs$/, 'update'],
    ['POST', /^\/v2\/entities\/.+\/attrs$/, 'create', {options: 'append'}],
    ['POST', /^\/v2\/entities\/.+\/attrs$/, 'update'],
    ['DELETE', /^\/v2\/entities\/.+/, 'delete'],
    ['PUT', /^\/v2\/entities\/.+\/attrs$/, 'update'],
    ['GET', /^\/v2\/entities\/.+\/attrs\/.+/, 'read'],
    ['PUT', /^\/v2\/entities\/.+\/attrs\/.+/, 'update'],
    ['DELETE', /^\/v2\/entities\/.+\/attrs\/.+/, 'delete'],
    ['GET', /^\/v2\/entities\/.+\/attrs\/.+\/value$/, 'read'],
    ['PUT', /^\/v2\/entities\/.+\/attrs\/.+\/value$/, 'update'],
    ['GET', /^\/v2\/types$/, 'read'],
    ['GET', /^\/v2\/types\/.+/, 'read'],
    ['GET', /^\/v2\/subscriptions$/, 'read'],
    ['POST', /^\/v2\/subscriptions$/, 'create'],
    ['GET', /^\/v2\/subscriptions\/.+/, 'read'],
    ['PATCH', /^\/v2\/subscriptions\/.+/, 'update'],
    ['DELETE', /^\/v2\/subscriptions\/.+/, 'delete'],
    ['GET', /^\/v2\/registrations$/, 'read'],
    ['POST', /^\/v2\/registrations$/, 'create'],
    ['GET', /^\/v2\/registrations\/.+/, 'read'],
    ['PATCH', /^\/v2\/registrations\/.+/, 'update'],
    ['DELETE', /^\/v2\/registrations\/.+/, 'delete'],

    /* Version Operation */
    ['GET', /^\/version/, 'read']
];
