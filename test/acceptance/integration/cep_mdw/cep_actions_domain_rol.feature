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

@cep_actions_domain
Feature: CEP actions when the rol is defined only in the domain
  Check if all urls of CEP are mapped to the correct action. This actions are defined in the domain of the user in Keystone

  Background:
    Given the Perseo configuration

  Scenario: Notify action
    Given a domain without projects in KEYSTONE
    And a "user_notify_domain" user in domain without projects
    And a "notify_rol" role in the user and domain
    And a url with "/notices"
    When a CEP "POST" petition is asked to PEP
    Then the petition gets to the mock

  Scenario Outline: Read Rule action
    Given a domain without projects in KEYSTONE
    And a "user_readRule_domain" user in domain without projects
    And a "readRule_rol" role in the user and domain
    And a url with "<url>"
    When a CEP "<action>" petition is asked to PEP
    Then the petition gets to the mock
  Examples:
    | url            | action |
    | /rules         | GET    |
    | /rules/id      | GET    |
    | /m2m/vrules    | GET    |
    | /m2m/vrules/id | GET    |

  Scenario Outline: Write Rule action
    Given a domain without projects in KEYSTONE
    And a "user_writeRule_domain" user in domain without projects
    And a "writeRule_rol" role in the user and domain
    And a url with "<url>"
    When a CEP "<action>" petition is asked to PEP
    Then the petition gets to the mock
  Examples:
    | url            | action |
    | /rules         | POST   |
    | /rules/id      | DELETE |
    | /m2m/vrules    | POST   |
    | /m2m/vrules/id | DELETE |
    | /m2m/vrules/id | PUT    |