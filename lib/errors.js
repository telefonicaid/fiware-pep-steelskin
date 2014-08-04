/*
 * Copyright 2013 Telefonica Investigación y Desarrollo, S.A.U
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
 * please contact with::[daniel.moranjimenez@telefonica.com]
 */

var errors= {
    'ORGANIZATION_NOT_FOUND': function() {
        this.name = 'ORGANIZATION_NOT_FOUND';
        this.message = 'Organization not found';
    },
    'USER_NOT_FOUND': function() {
        this.name = 'USER_NOT_FOUND';
        this.message = 'User credentials not found';
    },
    'ACTION_NOT_FOUND': function() {
        this.name = 'ACTION_NOT_FOUND';
        this.message = 'The system wasn\'t able to guess the action type or the request';
    },
    'WRONG_XML_PAYLOAD': function() {
        this.name = 'WRONG_XML_PAYLOAD';
        this.message = 'The system wasn\'t able to parse the given XML payload';
    },
    'WRONG_JSON_PAYLOAD': function() {
        this.name = 'WRONG_JSON_PAYLOAD';
        this.message = 'The system wasn\'t able to parse the given JSON payload (either it was empty or wrong)';
    }
};

for (var errorFn in errors) {
    errors[errorFn].prototype = new Error();
    errors[errorFn].prototype.constructor = errors[errorFn];
}

module.exports = errors;