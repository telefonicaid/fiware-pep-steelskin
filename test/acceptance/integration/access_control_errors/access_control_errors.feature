# Created by Jon at 07/01/2015
Feature: Errors raised by PEP because of errors from/to Keystone
  # Enter feature description here

  Background:
    Given the Context Broker configuration

  @access_control_errors
  Scenario: Access denied because rol in project
    Given headers of bad rol environment with project
    And a url with "v1/queryContext"
    When the petition action "POST" is asked without data
    Then the access control proxy receive the last petition "pdp/v3" from PEP
    And the PEP returns an error

  @access_control_errors
  Scenario: Access denied because rol in domain
    Given headers of bad rol environment without project
    And a url with "v1/queryContext"
    When the petition action "POST" is asked without data
    Then the access control proxy receive the last petition "pdp/v3" from PEP
    And the PEP returns an error