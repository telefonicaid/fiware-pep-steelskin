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

function validationRequest(logger, roles, frn, action, headers, callback) {
    var cacheKey = frn + '#' + action + '#' + roles.join('-');

    // CB actions could be: create, update, delete, read, subscribe, register, discover, subscribe-availability
    // Perseo actions could be: readRule, writeRule, notify
    // Rest (iota, sth) acitons could be: create, update, delete, read

    // roles -> [ {id: 1, name: "4#SubServiceAdminORION" }, {id: 2, name "3#SubServiceAdminPERSEO" } ] 

    // Headers -> if apply over service or subservice ?
    // frn ->  [fiware:orion:smartcity:/tourism:::

    var decision = 'Permit';


    // TBD:
    
    var finalDecision = decision || 'Invalid';
    cacheUtils.get().data.validation.set(cacheKey, finalDecision);
}
