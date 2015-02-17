# Created by Jon at 07/01/2015
Feature: PeP cache in user, project and roles
  # Enter feature description here

  Background:
    Given the keystone proxy history reset

  @cache
  Scenario: Test cache with the same token
    Given the cache gradual configuration
    And headers general
    And a url with "/v1/queryContext"
    When the petition action "POST" is asked without data
    And the history is saved
    And the petition action "POST" is asked without data
    Then the PEP returns an ok
    And the history is the same as saved
    And waits "30" seconds to "all" cache expire

  @cache
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
    And waits "30" seconds to "all" cache expire

  @cache
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
    And waits "30" seconds to "all" cache expire

  @cache
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
    And waits "30" seconds to "all" cache expire

  @cache
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
    And waits "30" seconds to "all" cache expire

  @cache
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
    And waits "30" seconds to "all" cache expire

  @cache
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
    And waits "30" seconds to "all" cache expire