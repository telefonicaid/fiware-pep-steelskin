'use strict';

var tdigitalNodeBoilerplate = require('../../');

describe('Extract information from requests', function() {
    describe('When a request to the CSB arrives to the proxy with all the information', function () {
        it('should extract the organization to an attribute in the request');
        it('should guess the action looking to the URL and the body an add it to an attribute in the request');
        it('should extract the user token to an attribute in the request');
    });

    describe('When a request arrives to the CSB without a user token', function () {
        it ('should reject the request with a 401 error code');
    });
});
