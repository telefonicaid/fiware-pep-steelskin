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

@cache
Feature: PeP cache in user, project and roles

  Background:
    Given the keystone proxy history reset

  Scenario: Test cache with the same token
    Given the cache gradual configuration
    And a KEYSTONE CONFIGURATION with all roles in the same project
    And set the request HEADERS with the previous KEYSTONE CONFIGURATION ant the format "json"
    And set the request URL with the path "/v1/queryContext"
    And set the request METHOD as "POST"
    When the request built before is sent to PEP
    And the history is saved
    And the request built before is sent to PEP
    Then the PEP returns an ok
    And the history is the same as saved
    And waits "35" seconds to "all" cache expire

  Scenario: Test cache with different tokens
    Given the cache gradual configuration
    And a KEYSTONE CONFIGURATION with all roles in the same project
    And set the request HEADERS with the previous KEYSTONE CONFIGURATION ant the format "json"
    And set the request URL with the path "/v1/queryContext"
    And set the request METHOD as "POST"
    When the request built before is sent to PEP
    And the history is saved
    And set the request HEADERS with the previous KEYSTONE CONFIGURATION ant the format "json"
    And set the request URL with the path "/v1/queryContext"
    And set the request METHOD as "POST"
    And the request built before is sent to PEP
    Then the PEP returns an ok
    And the history of petitions adds "1" petition
    And waits "35" seconds to "all" cache expire

  Scenario: Test cache user expired
    Given the cache gradual configuration
    And a KEYSTONE CONFIGURATION with all roles in the same project
    And set the request HEADERS with the previous KEYSTONE CONFIGURATION ant the format "json"
    And set the request URL with the path "/v1/queryContext"
    And set the request METHOD as "POST"
    When the request built before is sent to PEP
    And the history is saved
    And waits "10" seconds to "all" cache expire
    And the request built before is sent to PEP
    Then the PEP returns an ok
    And the history of petitions adds "1" petition
    And waits "35" seconds to "all" cache expire

  Scenario: Test cache user and projects expired
    Given the cache gradual configuration
    And a KEYSTONE CONFIGURATION with all roles in the same project
    And set the request HEADERS with the previous KEYSTONE CONFIGURATION ant the format "json"
    And set the request URL with the path "/v1/queryContext"
    And set the request METHOD as "POST"
    When the request built before is sent to PEP
    And the history is saved
    And waits "20" seconds to "all" cache expire
    And the request built before is sent to PEP
    Then the PEP returns an ok
    And the history of petitions adds "2" petition
    And waits "35" seconds to "all" cache expire

  Scenario: Test cache expired completed
    Given the cache gradual configuration
    And a KEYSTONE CONFIGURATION with all roles in the same project
    And set the request HEADERS with the previous KEYSTONE CONFIGURATION ant the format "json"
    And set the request URL with the path "/v1/queryContext"
    And set the request METHOD as "POST"
    When the request built before is sent to PEP
    And the history is saved
    And waits "30" seconds to "all" cache expire
    And the request built before is sent to PEP
    Then the PEP returns an ok
    And the history of petitions adds "3" petition
    And waits "35" seconds to "all" cache expire

  Scenario: Test cache projects expired
    Given the cache projects configuration
    And a KEYSTONE CONFIGURATION with all roles in the same project
    And set the request HEADERS with the previous KEYSTONE CONFIGURATION ant the format "json"
    And set the request URL with the path "/v1/queryContext"
    And set the request METHOD as "POST"
    When the request built before is sent to PEP
    And the history is saved
    And waits "10" seconds to "projects" cache expire
    And the request built before is sent to PEP
    Then the PEP returns an ok
    And the history of petitions adds "1" petition
    And the value added to the history is a request of the cache expired
    And waits "35" seconds to "all" cache expire

  Scenario: Test cache roles expired
    Given the cache roles configuration
    And a KEYSTONE CONFIGURATION with all roles in the same project
    And set the request HEADERS with the previous KEYSTONE CONFIGURATION ant the format "json"
    And set the request URL with the path "/v1/queryContext"
    And set the request METHOD as "POST"
    When the request built before is sent to PEP
    And the history is saved
    And waits "10" seconds to "roles" cache expire
    And the request built before is sent to PEP
    Then the PEP returns an ok
    And the history of petitions adds "1" petition
    And the value added to the history is a request of the cache expired
    And waits "35" seconds to "all" cache expire