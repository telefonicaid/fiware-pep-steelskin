'use strict';

var tdigitalNodeBoilerplate = require('../../');

describe('Validate action with Access Control', function() {
    describe('When a request to the CSB arrives to the proxy with appropriate permissions', function () {
        it('should send a validation request to Access Control');
        it('should proxy the request to the destination');
    });

    describe('When a request to the CSB arrives for a user with wrong permissions', function () {
        it ('should reject the request with a 403 error code');
    });
});