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

@ac_actions_domain
Feature: AC actions when the role is defined only in the domain
  check if all urls of AC, with the correct permissions in AC, get for its destination

  Background:
    Given the Access Control configuration

  Scenario: Read policy
    Given a Keystone configuration with roles in the domains and the user "user_readPolicy_domain"
    And a token request is sent with the previous Keystone configuration
    And headers build with the information set before and with format "json"
    And set the payload as "{'test_payload': 'test_value'}"
    And build a PEP url with the path "/pap/v1/subject/subjectName/policy/policyName"
    And a "GET" request is built with the previous data
    When a request is sent to PEP with the request built before
    Then the petition gets to the mock

  Scenario: Remove policy
    Given a Keystone configuration with roles in the domains and the user "user_removePolicy_domain"
    And a token request is sent with the previous Keystone configuration
    And headers build with the information set before and with format "json"
    And set the payload as "{'test_payload': 'test_value'}"
    And build a PEP url with the path "/pap/v1/subject/subjectName/policy/policyName"
    And a "DELETE" request is built with the previous data
    When a request is sent to PEP with the request built before
    Then the petition gets to the mock

  Scenario: Create policy
    Given a Keystone configuration with roles in the domains and the user "user_createPolicy_domain"
    And a token request is sent with the previous Keystone configuration
    And headers build with the information set before and with format "json"
    And set the payload as "{'test_payload': 'test_value'}"
    And build a PEP url with the path "/pap/v1/subject/subjectName"
    And a "POST" request is built with the previous data
    When a request is sent to PEP with the request built before
    Then the petition gets to the mock

  Scenario: List policies
    Given a Keystone configuration with roles in the domains and the user "user_listPolicies_domain"
    And a token request is sent with the previous Keystone configuration
    And headers build with the information set before and with format "json"
    And set the payload as "{'test_payload': 'test_value'}"
    And build a PEP url with the path "/pap/v1/subject/subjectName"
    And a "GET" request is built with the previous data
    When a request is sent to PEP with the request built before
    Then the petition gets to the mock

  Scenario: Delete subject policies
    Given a Keystone configuration with roles in the domains and the user "user_deleteSubjectPolicies_domain"
    And a token request is sent with the previous Keystone configuration
    And headers build with the information set before and with format "json"
    And set the payload as "{'test_payload': 'test_value'}"
    And build a PEP url with the path "/pap/v1/subject/subjectName"
    And a "DELETE" request is built with the previous data
    When a request is sent to PEP with the request built before
    Then the petition gets to the mock

  Scenario: Delete tenant policies
    Given a Keystone configuration with roles in the domains and the user "user_deleteTenantPolicies_domain"
    And a token request is sent with the previous Keystone configuration
    And headers build with the information set before and with format "json"
    And set the payload as "{'test_payload': 'test_value'}"
    And build a PEP url with the path "/pap/v1"
    And a "DELETE" request is built with the previous data
    When a request is sent to PEP with the request built before
    Then the petition gets to the mock