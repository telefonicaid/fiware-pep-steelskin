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

var util = require('util');

var errors = {
    MissingHeaders: function(msg) {
        this.name = 'MISSING_HEADERS';
        this.message = 'Some headers were missing from the request: ' + msg;
        this.code = 400;
    },
    UserNotFound: function() {
        this.name = 'USER_NOT_FOUND';
        this.message = 'User credentials not found';
        this.code = 400;
    },
    TokenDoesNotMatchService: function() {
        this.name = 'TOKEN_DOES_NOT_MATCH_SERVICE';
        this.message = 'The provided token does not belong to the provided service.';
        this.code = 401;
    },
    ActionNotFound: function() {
        this.name = 'ACTION_NOT_FOUND';
        this.message = 'The system wasn\'t able to guess the action type or the request';
        this.code = 400;
    },
    WrongXmlPayload: function() {
        this.name = 'WRONG_XML_PAYLOAD';
        this.message = 'The system wasn\'t able to parse the given XML payload';
        this.code = 400;
    },
    WrongJsonPayload: function() {
        this.name = 'WRONG_JSON_PAYLOAD';
        this.message = 'The system wasn\'t able to parse the given JSON payload (either it was empty or wrong)';
        this.code = 400;
    },
    WrongXmlValidationResponse: function() {
        this.name = 'WRONG_XML_VALIDATION_RESPONSE';
        this.message = 'The system wasn\'t able to parse the XML obtained from the Access Control';
        this.code = 500;
    },
    KeystoneConnectionError: function(e) {
        this.name = 'KEYSTONE_CONNECTION_ERROR';
        this.message = 'There was a connection error accessing the Access Control: ' + e.message;
        this.code = 500;
    },
    KeystoneValidationError: function(message) {
        this.name = 'KEYSTONE_VALIDATION_ERROR';
        this.message = 'The Access Control failed to make a decision due to the following error: ' + message;
        this.code = 500;
    },
    KeystoneAuthenticationError: function(msg) {
        this.name = 'KEYSTONE_AUTHENTICATION_ERROR';
        this.message = 'There was a connection error while authenticating to Keystone: ' + msg;
        this.code = 500;
    },
    KeystoneAuthenticationRejected: function(code) {
        this.name = 'KEYSTONE_AUTHENTICATION_REJECTED';
        this.message = 'User authentication was rejected with code: ' + code;
        this.code = 401;
    },
    KeystoneSubserviceNotFound: function(name) {
        this.name = 'KEYSTONE_SUBSERVICE_NOT_FOUND';
        this.message = 'Could not find subservice with name [' + name + '] in Keystone.';
        this.code = 401;
    },
    PepProxyAuthenticationRejected: function(code) {
        this.name = 'PEP_PROXY_AUTHENTICATION_REJECTED';
        this.message = 'Proxy authentication was rejected with code: ' + code;
        this.code = 500;
    },
    RolesNotFound: function(subservice) {
        this.name = 'ROLES_NOT_FOUND';
        this.message = 'No roles were found for the user token in the give subservice: ' + subservice;
        this.code = 401;
    },
    AccessDenied: function() {
        this.name = 'ACCESS_DENIED';
        this.message = 'The user does not have the appropriate permissions to access the selected action';
        this.code = 403;
    },
    TemplateLoadingError: function(e) {
        this.name = 'TEMPLATE_LOADING_ERROR';
        this.message = 'There was an error loading the templates for the validation Request: ' + e.message;
        this.code = 500;
    },
    UnexpectedContentType: function(contentType) {
        this.name = 'UNEXPECTED_CONTENT_TYPE';
        this.message = 'The MIME content type received is not supported: ' + contentType;
        this.code = 415;
    },
    TargetServerError: function(msg) {
        this.name = 'TARGET_SERVER_ERROR';
        this.message = 'There was an error redirecting the request to the target server: ' + msg;
        this.code = 501;
    }
};

for (var errorFn in errors) {
    if (errors.hasOwnProperty(errorFn)) {
        util.inherits(errors[errorFn], Error);
    }
}

module.exports = errors;

