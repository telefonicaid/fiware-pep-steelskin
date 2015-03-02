# Copyright 2014 Telefonica Investigación y Desarrollo, S.A.U
#
# This file is part of fiware-orion-pep
#
# fiware-orion-pep is free software: you can redistribute it and/or
# modify it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the License,
# or (at your option) any later version.
#
# fiware-orion-pep is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
# See the GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public
# License along with fiware-orion-pep.
# If not, seehttp://www.gnu.org/licenses/.
#
# For those usages not covered by the GNU Affero General Public License
# please contact with::[iot_support@tid.es]
# __author__ = 'Jon Calderin Goñi (jon dot caldering at gmail dot com)'

@headers
Feature: Test request headers
  The environment is set, with one user, with role in the domain and in a project inside the domain

  Background:
    Given the Headers Context Broker configuration without cache

  @missing_headers @unexpected_content_type
  Scenario Outline: Test incomplete headers CB KO append Action
    Given headers with format "<format>" and "APPEND" action
    And headers without the header "<header>"
    And a url with "/v1/updateContext"
    When the petition action "GET" is asked
    Then the Keystone proxy receive the last petition "<last_petition>" from pep
    And the PEP returns an error with code "<error_code>" and name "<error_name>"

  Examples:
    | header             | format | last_petition | error_code | error_name              |
    | Fiware-Servicepath | json   |               | 400        | MISSING_HEADERS         |
    | Fiware-Servicepath | xml    |               | 400        | MISSING_HEADERS         |
    | Fiware-Service     | json   |               | 400        | MISSING_HEADERS         |
    | Fiware-Service     | xml    |               | 400        | MISSING_HEADERS         |
    | content-type       | json   |               | 415        | UNEXPECTED_CONTENT_TYPE |
    | content-type       | xml    |               | 415        | UNEXPECTED_CONTENT_TYPE |
    | X-Auth-Token       | json   |               | 400        | MISSING_HEADERS         |
    | X-Auth-Token       | xml    |               | 400        | MISSING_HEADERS         |

  @missing_headers @unexpected_content_type
  Scenario Outline: Test incomplete headers CB KO update Action
    Given headers with format "<format>" and "UPDATE" action
    And headers without the header "<header>"
    And a url with "/v1/updateContext"
    When the petition action "GET" is asked
    Then the Keystone proxy receive the last petition "<last_petition>" from pep
    And the PEP returns an error with code "<error_code>" and name "<error_name>"

  Examples:
    | header             | format | last_petition | error_code | error_name              |
    | Fiware-Servicepath | json   |               | 400        | MISSING_HEADERS         |
    | Fiware-Servicepath | xml    |               | 400        | MISSING_HEADERS         |
    | Fiware-Service     | json   |               | 400        | MISSING_HEADERS         |
    | Fiware-Service     | xml    |               | 400        | MISSING_HEADERS         |
    | content-type       | json   |               | 415        | UNEXPECTED_CONTENT_TYPE |
    | content-type       | xml    |               | 415        | UNEXPECTED_CONTENT_TYPE |
    | X-Auth-Token       | json   |               | 400        | MISSING_HEADERS         |
    | X-Auth-Token       | xml    |               | 400        | MISSING_HEADERS         |

  @missing_headers @unexpected_content_type
  Scenario Outline: Test incomplete headers CB KO delete Action
    Given headers with format "<format>" and "DELETE" action
    And headers without the header "<header>"
    And a url with "/v1/updateContext"
    When the petition action "GET" is asked
    Then the Keystone proxy receive the last petition "<last_petition>" from pep
    And the PEP returns an error with code "<error_code>" and name "<error_name>"

  Examples:
    | header             | format | last_petition | error_code | error_name              |
    | Fiware-Servicepath | json   |               | 400        | MISSING_HEADERS         |
    | Fiware-Servicepath | xml    |               | 400        | MISSING_HEADERS         |
    | Fiware-Service     | json   |               | 400        | MISSING_HEADERS         |
    | Fiware-Service     | xml    |               | 400        | MISSING_HEADERS         |
    | content-type       | json   |               | 415        | UNEXPECTED_CONTENT_TYPE |
    | content-type       | xml    |               | 415        | UNEXPECTED_CONTENT_TYPE |
    | X-Auth-Token       | json   |               | 400        | MISSING_HEADERS         |
    | X-Auth-Token       | xml    |               | 400        | MISSING_HEADERS         |


  @missing_headers
  Scenario Outline: Test incomplete headers CB KO read Action
    Given headers with format "<format>"
    And headers without the header "<header>"
    And a url with "/v1/queryContext"
    When the petition action "POST" is asked without data
    Then the Keystone proxy receive the last petition "<last_petition>" from pep
    And the PEP returns an error with code "<error_code>" and name "<error_name>"

  Examples:
    | header             | format | last_petition | error_code | error_name      |
    | Fiware-Servicepath | json   |               | 400        | MISSING_HEADERS |
    | Fiware-Servicepath | xml    |               | 400        | MISSING_HEADERS |
    | Fiware-Service     | json   |               | 400        | MISSING_HEADERS |
    | Fiware-Service     | xml    |               | 400        | MISSING_HEADERS |
    | X-Auth-Token       | json   |               | 400        | MISSING_HEADERS |
    | X-Auth-Token       | xml    |               | 400        | MISSING_HEADERS |


  @token_does_not_match_service @keystone_subservice_not_found
  Scenario Outline: Test bad header CB
    Given headers with format "<format>"
    And header "<header>" inexistent in KEYSTONE
    And a url with "/v1/queryContext"
    When the petition action "POST" is asked without data
    Then the Keystone proxy receive the last petition "<last_petition>" from PEP
    And the PEP returns an error with code "<error_code>" and name "<error_name>"

  Examples:
    | format | header             | last_petition  | error_code | error_name                    |
    | json   | Fiware-Service     | v3/auth/tokens | 401        | TOKEN_DOES_NOT_MATCH_SERVICE  |
    | xml    | Fiware-Service     | v3/auth/tokens | 401        | TOKEN_DOES_NOT_MATCH_SERVICE  |
    | json   | Fiware-Servicepath | v3/projects    | 401        | KEYSTONE_SUBSERVICE_NOT_FOUND |
    | xml    | Fiware-Servicepath | v3/projects    | 401        | KEYSTONE_SUBSERVICE_NOT_FOUND |


  Scenario Outline: Tests content-type header
    Given headers with format "<format>"
    And the content-type header with the value "<content-type-value>"
    And the payload with the value "<payload>"
    And a url with "/v1/queryContext"
    When the petition action "POST" is asked
    Then the petition gets to the mock

  Examples:
    | format | content-type-value             | payload          |
    | json   | application/json               | {'payload':true} |
    | xml    | application/xml                | <xml></xml>      |
    | xml    | application/xml                | any text         |
    | json   | application/json;charset utf-8 | {'payload':true} |
    | json   | application/xml;charset utf-8  | {'payload':true  |

  @wrong_json_payload @wrong_xml_payload
  Scenario Outline: Tests content-type header errors in cb
    Given headers with format "<format>"
    And the content-type header with the value "<content-type-value>"
    And the payload with the value "<payload>"
    And a url with "/v1/updateContext"
    When the petition action "POST" is asked
    Then the PEP returns an error with code "<error_code>" and name "<error_name>"

  Examples:
    | format | content-type-value             | payload          | error_code | error_name         |
    | json   | application/json               | {'payload':    } | 400        | WRONG_JSON_PAYLOAD |
    | xml    | application/xml                | <xml>     >      | 400        | WRONG_XML_PAYLOAD  |
    | xml    | application/xml                | any text         | 400        | WRONG_XML_PAYLOAD  |
    | json   | application/json;charset utf-8 | {'payload':    } | 400        | WRONG_JSON_PAYLOAD |
    | json   | application/json;charset utf-8  | <xml>   >        | 400        | WRONG_JSON_PAYLOAD |


