# Created by Jon at 05/01/2015
Feature: Errors raised by PEP because of errors from/to Keystone
  # Enter feature description here

  Background:
    Given the Context Broker configuration

  @keystone_errors
  Scenario: Bad token
    Given headers with bad token
    And a url with "v1/queryContext"
    When the petition action "POST" is asked without data
    Then the Keystone proxy receive the last petition "v3/auth/tokens" from PEP
    And the PEP returns an error

  @keystone_errors
  Scenario: Bad domain
    Given headers with bad domain
    And a url with "v1/queryContext"
    When the petition action "POST" is asked without data
    Then the Keystone proxy receive the last petition "v3/auth/tokens" from PEP
    And the PEP returns an error

  @keystone_errors
  Scenario: Bad project
    Given headers with bad project
    And a url with "v1/queryContext"
    When the petition action "POST" is asked without data
    Then the Keystone proxy receive the last petition "v3/projects" from PEP
    And the PEP returns an error

  @keystone_errors
  Scenario: Empty project
    Given headers with empty project
    And a url with "v1/queryContext"
    When the petition action "POST" is asked without data
    Then the Keystone proxy receive the last petition "v3/projects" from PEP
    And the PEP returns an error

  @keystone_errors
  Scenario: Domain with no roles
    Given headers with domain without roles
    And a url with "v1/queryContext"
    When the petition action "POST" is asked without data
    Then the Keystone proxy receive the last petition "v3/role_assignments" from PEP
    And the PEP returns an error

  @keystone_errors
  Scenario: Project with no roles
    Given headers with project without roles
    And a url with "v1/queryContext"
    When the petition action "POST" is asked without data
    Then the Keystone proxy receive the last petition "v3/role_assignments" from PEP
    And the PEP returns an error