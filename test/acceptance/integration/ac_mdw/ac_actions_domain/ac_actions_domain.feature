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

@ac_actions_domain
Feature: AC actions when the role is defined only in the domain
  check if all urls of AC, with the correct permissions in AC, get for its destination

  Background:
    Given the Access Control configuration

  Scenario: Read policy
    Given a KEYSTONE CONFIGURATION with roles in the domains and the user "user_readPolicy_domain"
    And set the request HEADERS with the previous KEYSTONE CONFIGURATION ant the format "json"
    And set the request PAYLOAD as "{'test_payload': 'test_value'}"
    And set the request URL with the path "/pap/v1/subject/subjectName/policy/policyName"
    And set the request METHOD as "GET"
    When the request built before is sent to PEP
    Then the petition gets to the mock

  Scenario: Remove policy
    Given a KEYSTONE CONFIGURATION with roles in the domains and the user "user_removePolicy_domain"
    And set the request HEADERS with the previous KEYSTONE CONFIGURATION ant the format "json"
    And set the request PAYLOAD as "{'test_payload': 'test_value'}"
    And set the request URL with the path "/pap/v1/subject/subjectName/policy/policyName"
    And set the request METHOD as "DELETE"
    When the request built before is sent to PEP
    Then the petition gets to the mock

  Scenario: Create policy
    Given a KEYSTONE CONFIGURATION with roles in the domains and the user "user_createPolicy_domain"
    And set the request HEADERS with the previous KEYSTONE CONFIGURATION ant the format "json"
    And set the request PAYLOAD as "{'test_payload': 'test_value'}"
    And set the request URL with the path "/pap/v1/subject/subjectName"
    And set the request METHOD as "POST"
    When the request built before is sent to PEP
    Then the petition gets to the mock

  Scenario: List policies
    Given a KEYSTONE CONFIGURATION with roles in the domains and the user "user_listPolicies_domain"
    And set the request HEADERS with the previous KEYSTONE CONFIGURATION ant the format "json"
    And set the request PAYLOAD as "{'test_payload': 'test_value'}"
    And set the request URL with the path "/pap/v1/subject/subjectName"
    And set the request METHOD as "GET"
    When the request built before is sent to PEP
    Then the petition gets to the mock

  Scenario: Delete subject policies
    Given a KEYSTONE CONFIGURATION with roles in the domains and the user "user_deleteSubjectPolicies_domain"
    And set the request HEADERS with the previous KEYSTONE CONFIGURATION ant the format "json"
    And set the request PAYLOAD as "{'test_payload': 'test_value'}"
    And set the request URL with the path "/pap/v1/subject/subjectName"
    And set the request METHOD as "DELETE"
    When the request built before is sent to PEP
    Then the petition gets to the mock

  Scenario: Delete tenant policies
    Given a KEYSTONE CONFIGURATION with roles in the domains and the user "user_deleteTenantPolicies_domain"
    And set the request HEADERS with the previous KEYSTONE CONFIGURATION ant the format "json"
    And set the request PAYLOAD as "{'test_payload': 'test_value'}"
    And set the request URL with the path "/pap/v1"
    And set the request METHOD as "DELETE"
    When the request built before is sent to PEP
    Then the petition gets to the mock