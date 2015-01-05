/*
 * Copyright 2014 Telefonica Investigación y Desarrollo, S.A.U
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
 * please contact with::[iot_support@tid.es]
 */

'use strict';

var config = require('../../config'),
    async = require('async'),
    NodeCache = require('node-cache'),
    EventEmitter = require('events').EventEmitter;

function createCache() {
    return {
        data: {
            subservice: new NodeCache({
                stdTTL: config.authentication.cacheTTLs.projectIds
            }),
            roles: new NodeCache({
                stdTTL: config.authentication.cacheTTLs.roles
            }),
            user: new NodeCache({
                stdTTL: config.authentication.cacheTTLs.users
            })
        },
        channel: new EventEmitter(),
        updating: {
            subservice: false
        }
    };
}

function cleanCache(cache) {
    cache.data.user = new NodeCache({
        stdTTL: config.authentication.cacheTTLs.users
    });
    cache.data.subservice = new NodeCache({
        stdTTL: config.authentication.cacheTTLs.projectIds
    });
    cache.data.roles = new NodeCache({
        stdTTL: config.authentication.cacheTTLs.roles
    });
}

/**
 * This function introduces a cache in a Keystone function, executing the value processing function with the cached
 * value if there is one that has not expired, or executing the value retrieval function instead. If a headers arrives
 * to the cache while the value is being updated, it is put on hold in an event channel, and awaken when the result
 * of the value retrieval has arrived.
 *
 * @param {String} cache                    Cache where the operations will be apply.
 * @param {String} cacheType                Name of the cache (user, roles or subserviceId).
 * @param {String} cacheKey                 Key of the item to retrieve.
 * @param {Function} retrieveRequestFn      Function to call to refresh a particular value.
 * @param {Function} processValueFn         Function to call when the value has been retrieved.
 */
function cacheAndHold(cache, cacheType, cacheKey, retrieveRequestFn, processValueFn, callback) {
    var cachedValue = cache.data[cacheType].get(cacheKey);

    if (cachedValue[cacheKey]) {
        processValueFn(cachedValue[cacheKey], callback);
    } else if (cache.updating[cacheType]) {
        cache.channel.on(cacheType, callback);
    } else {
        cache.updating[cacheType] = true;
        cache.channel.removeAllListeners(cacheType);
        cache.channel.on(cacheType, function(error, value) {
            callback(error, value);
        });

        async.waterfall([
            retrieveRequestFn,
            processValueFn
        ], function(error, value) {
            cache.channel.emit(cacheType, error, value);
        });
    }
}

exports.clean = cleanCache;
exports.create = createCache;
exports.cacheAndHold = cacheAndHold;
