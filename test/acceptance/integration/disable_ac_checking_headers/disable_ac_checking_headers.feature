# Copyright 2014 Telefonica Investigación y Desarrollo, S.A.U
#
# This file is part of fiware-pep-steelskin
#
# fiware-pep-steelskin is free software: you can redistribute it and/or
# modify it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the License,
# or (at your option) any later version.
#
# fiware-pep-steelskin is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
# See the GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public
# License along with fiware-pep-steelskin.
# If not, see http://www.gnu.org/licenses/.
#
# For those usages not covered by the GNU Affero General Public License
# please contact with::[iot_support at tid.es]
# __author__ = 'Jon Calderin Goñi (jon dot caldering at gmail dot com)'
@disable_ac
Feature: Disable ac
  In order to see if
  when the AC checking is deactivate
  the PEP do not forward the request to AC
  As a Context Broker plugin user
  Send requests for cb plugin

  Background:
    Given the Context Broker configuration with Access Control disabled

  Scenario: A user without roles in Keystone and with headers response ok without get AC
    Given a KEYSTONE CONFIGURATION with roles not in Access Control
    And set the request HEADERS with the previous KEYSTONE CONFIGURATION ant the format "json"
    And set the request URL with the path "/v1/queryContext"
    And add an example of PAYLOAD with "json" format
    And set the request METHOD as "POST"
    When the request built before is sent to PEP
    Then the petition gets to the mock
    And the access control proxy receive the last petition "" from PEP
    And the PEP returns an ok

  Scenario Outline: A user with roles in Keystone but not in AC and without headers and without token response ok without get AC
    Given a KEYSTONE CONFIGURATION with roles not in Access Control
    And set the request HEADERS with the previous KEYSTONE CONFIGURATION ant the format "json"
    And remove the header "<header>" from headers
    And set the request URL with the path "/v1/queryContext"
    And add an example of PAYLOAD with "json" format
    And set the request METHOD as "POST"
    When the request built before is sent to PEP
    Then the PEP returns an error with code "400" and name "MISSING_HEADERS"
  Examples:
    | header             |
    | fiware-service     |
    | fiware-servicepath |

