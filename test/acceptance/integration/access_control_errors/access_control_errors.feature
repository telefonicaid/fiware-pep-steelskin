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

@access_control_errors
Feature: Errors raised by PEP because of errors from/to Keystone

  Background:
    Given the Context Broker configuration

  @access_denied
  Scenario: Access denied because role in project
    Given headers of bad role environment with project
    And a url with "/v1/queryContext"
    When the petition action "POST" is asked without data
    Then the access control proxy receive the last petition "pdp/v3" from PEP
    And the PEP returns an error with code "403" and name "ACCESS_DENIED"

  @access_denied
  Scenario: Access denied because role in domain
    Given headers of bad role environment without project
    And a url with "/v1/queryContext"
    When the petition action "POST" is asked
    Then the access control proxy receive the last petition "pdp/v3" from PEP
    And the PEP returns an error with code "403" and name "ACCESS_DENIED"
