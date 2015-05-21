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

@version
Feature: Test the pep version consult in the administration port

  Background:
    Given the Context Broker configuration

  Scenario: Check the pep version returned is the same of the file package.json
    Given build a PEP administration url with the path "/version"
    And set the request METHOD as "GET"
    When the request built before is sent to PEP
    Then pep return the same version that are in package.json file