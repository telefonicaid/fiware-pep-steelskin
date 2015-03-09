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

@ac_mdw
Feature: AC middleware
  check if all urls of AC, with the correct permissions in AC, get for its destination

  Background:
    Given the Access Control configuration

  Scenario: Read policy
    Given a Keystone configuration with all roles in the same project
    And headers build with the information set before and with format "json"
    And set the payload as "{'test_payload': 'test_value'}"
    And build a PEP url with the path "/pap/v1/subject/subjectName/policy/policyName"
    And a "GET" request is built with the previous data
    When the request built before is sent to PEP
    Then the petition gets to the mock

  Scenario: Remove policy
    Given a Keystone configuration with all roles in the same project
    And headers build with the information set before and with format "json"
    And set the payload as "{'test_payload': 'test_value'}"
    And build a PEP url with the path "/pap/v1/subject/subjectName/policy/policyName"
    And a "DELETE" request is built with the previous data
    When the request built before is sent to PEP
    Then the petition gets to the mock

  Scenario: Create policy
    Given a Keystone configuration with all roles in the same project
    And headers build with the information set before and with format "json"
    And set the payload as "{'test_payload': 'test_value'}"
    And build a PEP url with the path "/pap/v1/subject/subjectName"
    And a "POST" request is built with the previous data
    When the request built before is sent to PEP
    Then the petition gets to the mock

  Scenario: List policies
    Given a Keystone configuration with all roles in the same project
    And headers build with the information set before and with format "json"
    And set the payload as "{'test_payload': 'test_value'}"
    And build a PEP url with the path "/pap/v1/subject/subjectName"
    And a "GET" request is built with the previous data
    When the request built before is sent to PEP
    Then the petition gets to the mock

  Scenario: Delete subject policies
    Given a Keystone configuration with all roles in the same project
    And headers build with the information set before and with format "json"
    And set the payload as "{'test_payload': 'test_value'}"
    And build a PEP url with the path "/pap/v1/subject/subjectName"
    And a "DELETE" request is built with the previous data
    When the request built before is sent to PEP
    Then the petition gets to the mock

  Scenario: Delete tenant policies
    Given a Keystone configuration with all roles in the same project
    And headers build with the information set before and with format "json"
    And set the payload as "{'test_payload': 'test_value'}"
    And build a PEP url with the path "/pap/v1"
    And a "DELETE" request is built with the previous data
    When the request built before is sent to PEP
    Then the petition gets to the mock

  Scenario Outline: Parameters-Query in ac urls
    Given a Keystone configuration with all roles in the same project
    And headers build with the information set before and with format "json"
    And set the payload as "{'test_payload': 'test_value'}"
    And build a PEP url with the path "<url>"
    And a "<action>" request is built with the previous data
    When the request built before is sent to PEP
    Then the petition gets to the mock
  Examples:
    | url                                                                        | action |
    | /pap/v1/subject/subjectName/policy/policyName?details=on&limit=15&offset=0 | GET    |
    | /pap/v1/subject/subjectName/policy/policyName?details=on&limit=15&offset=0 | DELETE |
    | /pap/v1/subject/subjectName?details=on&limit=15&offset=0                   | POST   |
    | /pap/v1/subject/subjectName?details=on&limit=15&offset=0                   | GET    |
    | /pap/v1/subject/subjectName?details=on&limit=15&offset=0                   | DELETE |
    | /pap/v1?details=on&limit=15&offset=0                                       | DELETE |
