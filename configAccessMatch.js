'use strict';

/**
 * List of access match
 */
var configAccessMatch = {};

// Activity related with a list of users
configAccessMatch.users = [
    'cloud_admin', 'pep',
];

// Activity related with request which the following headers
configAccessMatch.headers = [
    { "Fiware-service": "smartcity" },
];

// Activity related with request including the following subpaths
configAccessMatch.subpath = [
    '/v1',
];

// Activity related with request including the following strings in body
configAccessMatch.body = [
    'legacy'
];


exports.configAccessMatch = configAccessMatch;
