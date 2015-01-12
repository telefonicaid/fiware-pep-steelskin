# Created by Jon at 18/12/2014
Feature: Test bypass functionality
  To test the bypass configuration, a bypass role has to be defined in Keystone, and configured its id in PEP
  config.js, setting the bypass configuration as True

  Background:
    Given the Bypass configuration

  @bypass_keypass
  Scenario: Get to AC with a user with bypass role in domain
    Given a bypass domain in KEYSTONE
    And a user bypass in the domain
    And a "bypass_rol" rol in the domain
    And a url with "/pap/v1/subject/subjectName/policy/policyName"
    When a KeyPass "GET" petition is asked to PEP
    Then the petition gets to the mock


  @bypass_keypass
  Scenario: Get to AC with a user with bypass role in project
    Given a bypass domain in KEYSTONE
    And a user bypass in the domain
    And a "bypass_rol" rol in the project "project_bypass"
    And a url with "/pap/v1/subject/subjectName/policy/policyName"
    When a KeyPass "GET" petition is asked to PEP
    Then the petition gets to the mock