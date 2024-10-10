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

var constants = {
    X_FORWARDED_FOR_HEADER: 'x-forwarded-for',
    AUTHORIZATION_HEADER: 'x-auth-token',
    ORGANIZATION_HEADER: 'fiware-service',
    PATH_HEADER: 'fiware-servicepath',
    FORWARDED_HEADER: 'forwarded',
    X_REAL_IP_HEADER: 'x-real-ip',
    CORRELATOR_HEADER: 'fiware-correlator',

    GET_ROLES_PATH: '/user',
    NA: 'N/A'
};


module.exports = constants;
