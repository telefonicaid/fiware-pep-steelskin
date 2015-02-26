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

@cache
Feature: PeP cache in user, project and roles

  Background:
    Given the keystone proxy history reset

  Scenario: Test cache with the same token
    Given the cache gradual configuration
    And headers general
    And a url with "/v1/queryContext"
    When the petition action "POST" is asked without data
    And the history is saved
    And the petition action "POST" is asked without data
    Then the PEP returns an ok
    And the history is the same as saved
    And waits "35" seconds to "all" cache expire

  Scenario: Test cache with different tokens
    Given the cache gradual configuration
    And headers general
    And a url with "/v1/queryContext"
    When the petition action "POST" is asked without data
    And the history is saved
    And headers general
    And the petition action "POST" is asked without data
    Then the PEP returns an ok
    And the history of petitions adds "1" token petition
    And waits "35" seconds to "all" cache expire

  Scenario: Test cache user expired
    Given the cache gradual configuration
    And headers general
    And a url with "/v1/queryContext"
    When the petition action "POST" is asked without data
    And the history is saved
    And waits "10" seconds to "all" cache expire
    And the petition action "POST" is asked without data
    Then the PEP returns an ok
    And the history of petitions adds "1" token petition
    And waits "35" seconds to "all" cache expire

  Scenario: Test cache user and projects expired
    Given the cache gradual configuration
    And headers general
    And a url with "/v1/queryContext"
    When the petition action "POST" is asked without data
    And the history is saved
    And waits "20" seconds to "all" cache expire
    And the petition action "POST" is asked without data
    Then the PEP returns an ok
    And the history of petitions adds "2" token petition
    And waits "35" seconds to "all" cache expire

  Scenario: Test cache expired completed
    Given the cache gradual configuration
    And headers general
    And a url with "/v1/queryContext"
    When the petition action "POST" is asked without data
    And the history is saved
    And waits "30" seconds to "all" cache expire
    And the petition action "POST" is asked without data
    Then the PEP returns an ok
    And the history of petitions adds "3" token petition
    And waits "35" seconds to "all" cache expire

  Scenario: Test cache projects expired
    Given the cache projects configuration
    And headers general
    And a url with "/v1/queryContext"
    When the petition action "POST" is asked without data
    And the history is saved
    And waits "10" seconds to "projects" cache expire
    And the petition action "POST" is asked without data
    Then the PEP returns an ok
    And the history of petitions adds "1" token petition
    And the value added to the history is ok
    And waits "35" seconds to "all" cache expire

  Scenario: Test cache roles expired
    Given the cache roles configuration
    And headers general
    And a url with "/v1/queryContext"
    When the petition action "POST" is asked without data
    And the history is saved
    And waits "10" seconds to "roles" cache expire
    And the petition action "POST" is asked without data
    Then the PEP returns an ok
    And the history of petitions adds "1" token petition
    And the value added to the history is ok
    And waits "35" seconds to "all" cache expire