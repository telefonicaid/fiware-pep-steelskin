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

@bypass_keypass
Feature: Test bypass functionality
  To test the bypass configuration, a bypass role has to be defined in Keystone, and configured its id in PEP
  config.js, setting the bypass configuration as True

  Background:
    Given the Bypass configuration

  Scenario: Get to AC with a user with bypass role in domain
    Given a Keystone configuration with the bypass
    And headers build with the information set before and with format "json"
    And set the header "Fiware-Servicepath" with the value "/"
    And build a PEP url with the path "/pap/v1/subject/subjectName/policy/policyName"
    And a "GET" request is built with the previous data
    When the request built before is sent to PEP
    Then the petition gets to the mock

  Scenario: Get to AC with a user with bypass role in project
    Given a Keystone configuration with the bypass
    And headers build with the information set before and with format "json"
    And build a PEP url with the path "/pap/v1/subject/subjectName/policy/policyName"
    And a "GET" request is built with the previous data
    When the request built before is sent to PEP
    Then the petition gets to the mock