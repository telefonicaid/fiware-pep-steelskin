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

@cep_mdw
Feature: CEP middleware
  check if all urls of EPB, with the correct permissions in AC, could connect with CEP

  Background:
    Given the Perseo configuration

  Scenario: Notifications urls
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "/notices"
    When a CEP "POST" petition is asked to PEP
    Then the petition gets to the mock

  Scenario Outline: Rules urls
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "<url>"
    When a CEP "<action>" petition is asked to PEP
    Then the petition gets to the mock
  Examples:
    | url       | action |
    | /rules    | GET    |
    | /rules/id | GET    |
    | /rules    | POST   |
    | /rules/id | DELETE |

  Scenario Outline: Visual Rules urls
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "<url>"
    When a CEP "<action>" petition is asked to PEP
    Then the petition gets to the mock
  Examples:
    | url            | action |
    | /m2m/vrules    | GET    |
    | /m2m/vrules/id | GET    |
    | /m2m/vrules    | POST   |
    | /m2m/vrules/id | DELETE |
    | /m2m/vrules/id | PUT    |

  Scenario Outline: Parameters-Query in cep urls
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "<url>"
    When a CEP "<action>" petition is asked to PEP
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