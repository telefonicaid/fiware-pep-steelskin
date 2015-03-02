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

@bypass_keypass
Feature: Test bypass functionality
  To test the bypass configuration, a bypass role has to be defined in Keystone, and configured its id in PEP
  config.js, setting the bypass configuration as True

  Background:
    Given the Bypass configuration

  Scenario: Get to AC with a user with bypass role in domain
    Given a bypass domain in KEYSTONE
    And a user bypass in the domain
    And a "bypass_role" role in the domain
    And a url with "/pap/v1/subject/subjectName/policy/policyName"
    When a KeyPass "GET" petition is asked to PEP
    Then the petition gets to the mock

  Scenario: Get to AC with a user with bypass role in project
    Given a bypass domain in KEYSTONE
    And a user bypass in the domain
    And a "bypass_role" role in the project "project_bypass"
    And a url with "/pap/v1/subject/subjectName/policy/policyName"
    When a KeyPass "GET" petition is asked to PEP
    Then the petition gets to the mock