'use strict';

/**
 * List of access match
 */
var configAccessMatch = {};

// Activity related with a list of users
configAccessMatch.users = [
    // 'user1', 'user2',
];

// Activity related with request which the following headers
configAccessMatch.headers = [
    // { "fiware-service": "smartcity" },
    // { "x-real-ip": "127.0.0.1" }
];

// Activity related with request including the following subpaths
configAccessMatch.subpaths = [
    // '/v1',
];

// Activity related with request including the following subqueries
configAccessMatch.subqueries = [
    // 'flowControl',
];

// Activity related with request including the following strings in body
configAccessMatch.body = [
    // 'legacy'
];


exports.configAccessMatch = configAccessMatch;
