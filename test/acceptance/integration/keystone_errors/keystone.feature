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
# please contact with::[iot_support at tid.es]
# __author__ = 'Jon Calderin Goñi (jon dot caldering at gmail dot com)'

@keystone_errors
Feature: Errors raised by PEP because of errors from/to Keystone

  Background:
    Given the Context Broker configuration

  @keystone_authentication_rejected @issue-174
  Scenario: Bad token
    Given a KEYSTONE CONFIGURATION with all roles in the same project
    And set the request HEADERS with the previous KEYSTONE CONFIGURATION ant the format "json"
    And set the header "Fiware-Servicepath" with the value "/"
    And set the header "X-Auth-Token" with the value "badToken"
    And set the request URL with the path "/v1/queryContext"
    And set the request METHOD as "POST"
    When the request built before is sent to PEP
    Then the Keystone proxy receive the last petition "v3/auth/tokens" from PEP
    And And the PEP returns an error with code "401" and name "KEYSTONE_AUTHENTICATION_REJECTED"

  @token_does_not_match_service
  Scenario: Bad domain
    Given a KEYSTONE CONFIGURATION with all roles in the same project
    And set the request HEADERS with the previous KEYSTONE CONFIGURATION ant the format "json"
    And set the header "Fiware-Servicepath" with the value "/"
    And set the header "Fiware-Service" with the value "badDomain"
    And set the request URL with the path "/v1/queryContext"
    And set the request METHOD as "POST"
    When the request built before is sent to PEP
    Then the Keystone proxy receive the last petition "v3/auth/tokens" from PEP
    And the PEP returns an error with code "401" and name "TOKEN_DOES_NOT_MATCH_SERVICE"

  @keystone_subservice_not_found
  Scenario: Bad project
    Given a KEYSTONE CONFIGURATION with all roles in the same project
    And set the request HEADERS with the previous KEYSTONE CONFIGURATION ant the format "json"
    And set the header "Fiware-Servicepath" with the value "badProject"
    And set the request URL with the path "/v1/queryContext"
    And set the request METHOD as "POST"
    When the request built before is sent to PEP
    Then the Keystone proxy receive the last petition "v3/projects" from PEP
    And the PEP returns an error with code "401" and name "KEYSTONE_SUBSERVICE_NOT_FOUND"

  @roles_not_found
  Scenario: Domain with no roles
    Given a KEYSTONE CONFIGURATION with no roles
    And set the request HEADERS with the previous KEYSTONE CONFIGURATION ant the format "json"
    And set the header "Fiware-Servicepath" with the value "/"
    And set the request URL with the path "/v1/queryContext"
    And set the request METHOD as "POST"
    When the request built before is sent to PEP
    Then the Keystone proxy receive the last petition "v3/role_assignments" from PEP
    And the PEP returns an error with code "401" and name "ROLES_NOT_FOUND"

  @roles_not_found
  Scenario: Project with no roles
    Given a KEYSTONE CONFIGURATION with no roles
    And set the request HEADERS with the previous KEYSTONE CONFIGURATION ant the format "json"
    And set the request URL with the path "/v1/queryContext"
    And set the request METHOD as "POST"
    When the request built before is sent to PEP
    Then the Keystone proxy receive the last petition "v3/role_assignments" from PEP
    And the PEP returns an error with code "401" and name "ROLES_NOT_FOUND"

  @pep_proxy_authentication_rejected @issue-182
  Scenario: Pep with bad pep_user in configuration
    Given a KEYSTONE CONFIGURATION with no roles
    And restart pep with bad pep user
    And set the request HEADERS with the previous KEYSTONE CONFIGURATION ant the format "json"
    And set the request URL with the path "/v1/queryContext"
    And set the request METHOD as "POST"
    When the request built before is sent to PEP
    Then the PEP returns an error with code "500" and name "PEP_PROXY_AUTHENTICATION_REJECTED"