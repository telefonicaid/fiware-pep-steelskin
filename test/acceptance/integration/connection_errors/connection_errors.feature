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
# If not, see http://www.gnu.org/licenses/.
#
# For those usages not covered by the GNU Affero General Public License
# please contact with::[iot_support@tid.es]
# __author__ = 'Jon Calderin Goñi (jon dot caldering at gmail dot com)'

@connection_errors
Feature: Check the errors connecting with KS

  Background:
    Given the Context Broker configuration without cache

  @keystone_authentication_error
  Scenario: Error with the connection with KS
    Given a Keystone configuration with all roles in the same project
    And headers build with the information set before and with format "json"
    And build a PEP url with the path "/v1/queryContext"
    And a "POST" request is built with the previous data
    And restart pep with bad ks configuration
    When the request built before is sent to PEP
    Then the PEP returns an error with code "500" and name "KEYSTONE_AUTHENTICATION_ERROR"

  @access_control_validation_error
  Scenario: Error with the connection with AC
    Given a Keystone configuration with all roles in the same project
    And headers build with the information set before and with format "json"
    And build a PEP url with the path "/v1/queryContext"
    And a "POST" request is built with the previous data
    And restart "ac" process with bad final component port
    When the request built before is sent to PEP
    Then the PEP returns an error with code "500" and name "ACCESS_CONTROL_VALIDATION_ERROR"
    And restore the process "ac"

  @access_control_connection_error
  Scenario: Error with the connection with AC
    Given a Keystone configuration with all roles in the same project
    And headers build with the information set before and with format "json"
    And build a PEP url with the path "/v1/queryContext"
    And a "POST" request is built with the previous data
    And restart pep with bad ac configuration
    When the request built before is sent to PEP
    Then the PEP returns an error with code "500" and name "ACCESS_CONTROL_CONNECTION_ERROR"

  @target_server_error
  Scenario: Error with the connection with target
   Given a Keystone configuration with all roles in the same project
    And headers build with the information set before and with format "json"
    And build a PEP url with the path "/v1/queryContext"
    And a "POST" request is built with the previous data
    And restart pep with bad target configuration
    When the request built before is sent to PEP
    Then the PEP returns an error with code "501" and name "TARGET_SERVER_ERROR"
