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

@cep_mdw
Feature: CEP middleware
  check if all urls of EPB, with the correct permissions in AC, could connect with CEP

  Background:
    Given the Perseo configuration

  Scenario: Notifications urls
    Given a KEYSTONE CONFIGURATION with all roles in the same project
    And set the request URL with the path "/notices"
    And set the request HEADERS with the previous KEYSTONE CONFIGURATION ant the format "json"
    And add an example of PAYLOAD with "json" format
    And set the request METHOD as "POST"
    When the request built before is sent to PEP
    Then the petition gets to the mock

  Scenario Outline: Rules urls
    Given a KEYSTONE CONFIGURATION with all roles in the same project
    And set the request URL with the path "<url>"
    And set the request HEADERS with the previous KEYSTONE CONFIGURATION ant the format "json"
    And add an example of PAYLOAD with "json" format
    And set the request METHOD as "<action>"
    When the request built before is sent to PEP
    Then the petition gets to the mock

  Examples:
    | url       | action |
    | /rules    | GET    |
    | /rules/id | GET    |
    | /rules    | POST   |
    | /rules/id | DELETE |

  Scenario Outline: Visual Rules urls
    Given a KEYSTONE CONFIGURATION with all roles in the same project
    And set the request URL with the path "<url>"
    And set the request HEADERS with the previous KEYSTONE CONFIGURATION ant the format "json"
    And add an example of PAYLOAD with "json" format
    And set the request METHOD as "<action>"
    When the request built before is sent to PEP
    Then the petition gets to the mock
  Examples:
    | url            | action |
    | /m2m/vrules    | GET    |
    | /m2m/vrules/id | GET    |
    | /m2m/vrules    | POST   |
    | /m2m/vrules/id | DELETE |
    | /m2m/vrules/id | PUT    |

  Scenario Outline: Parameters-Query in cep urls
    Given a KEYSTONE CONFIGURATION with all roles in the same project
    And set the request URL with the path "<url>"
    And set the request HEADERS with the previous KEYSTONE CONFIGURATION ant the format "json"
    And add an example of PAYLOAD with "json" format
    And set the request METHOD as "<action>"
    When the request built before is sent to PEP
    Then the petition gets to the mock
  Examples:
    | url                                         | action |
    | /rules?details=on&limit=15&offset=0         | GET    |
    | /rules/id?details=on&limit=15&offset=0      | GET    |
    | /rules?details=on&limit=15&offset=0         | POST   |
    | /rules/id?details=on&limit=15&offset=0      | DELETE |
    | /m2m/vrules?details=on&limit=15&offset=0    | GET    |
    | /m2m/vrules/id?details=on&limit=15&offset=0 | GET    |
    | /m2m/vrules?details=on&limit=15&offset=0    | POST   |
    | /m2m/vrules/id?details=on&limit=15&offset=0 | DELETE |
    | /m2m/vrules/id?details=on&limit=15&offset=0 | PUT    |