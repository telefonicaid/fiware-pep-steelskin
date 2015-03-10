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

@urls_ac_ko
Feature: Urls that not exist in Access Control plugin

  Background:
    Given the Access Control configuration

  @action_not_found
  Scenario: Test bad URL AC KO
    Given headers
    And a url with "/pap/v1/subjec"
    When the petition action "GET" is asked without data
    Then the Keystone proxy receive the last petition "" from PEP
    And the PEP returns an error with code "400" and name "ACTION_NOT_FOUND"

