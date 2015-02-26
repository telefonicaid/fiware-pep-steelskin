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

@ac_actions_project
Feature: AC actions when the rol is defined only in a project
  check if all urls of EPB, with the correct permissions in AC, could connect with CEP

  Background:
    Given the Keypass configuration

  Scenario: Read policy
    Given a domain for project_only in KEYSTONE
    And a without role in domain and with "user_readPolicy_project" user in project
    And a "readPolicy_rol" role in the user project
    And a url with "/pap/v1/subject/subjectName/policy/policyName"
    When a KeyPass "GET" petition is asked to PEP
    Then the petition gets to the mock

  Scenario: Remove policy
    Given a domain for project_only in KEYSTONE
    And a without role in domain and with "user_removePolicy_project" user in project
    And a "removePolicy_rol" role in the user project
    And a url with "/pap/v1/subject/subjectName/policy/policyName"
    When a KeyPass "DELETE" petition is asked to PEP
    Then the petition gets to the mock

  Scenario: Create policy
    Given a domain for project_only in KEYSTONE
    And a without role in domain and with "user_createPolicy_project" user in project
    And a "createPolicy_rol" role in the user project
    And a url with "/pap/v1/subject/subjectName"
    When a KeyPass "POST" petition is asked to PEP
    Then the petition gets to the mock

  Scenario: List policies
    Given a domain for project_only in KEYSTONE
    And a without role in domain and with "user_listPolicies_project" user in project
    And a "listPolicies_rol" role in the user project
    And a url with "/pap/v1/subject/subjectName"
    When a KeyPass "GET" petition is asked to PEP
    Then the petition gets to the mock

  Scenario: Delete subject policies
    Given a domain for project_only in KEYSTONE
    And a without role in domain and with "user_deleteSubjectPolicies_project" user in project
    And a "deleteSubjectPolicies_rol" role in the user project
    And a url with "/pap/v1/subject/subjectName"
    When a KeyPass "DELETE" petition is asked to PEP
    Then the petition gets to the mock

  Scenario: Delete tenant policies
    Given a domain for project_only in KEYSTONE
    And a without role in domain and with "user_deleteTenantPolicies_project" user in project
    And a "deleteTenantPolicies_rol" role in the user project
    And a url with "/pap/v1"
    When a KeyPass "DELETE" petition is asked to PEP
    Then the petition gets to the mock