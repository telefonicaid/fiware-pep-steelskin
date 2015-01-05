# Created by Jon at 18/12/2014
Feature: AC middleware
  check if all urls of EPB, with the correct permissions in AC, could connect with CEP

  Background:
    Given the Bypass configuration

  @ac_mdw
  Scenario: Read policy
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "/pap/v1/subject/subjectName/policy/policyName"
    When a KeyPass "GET" petition is asked to PEP
    Then the petition gets to the mock

  @ac_mdw
  Scenario: Remove policy
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "/pap/v1/subject/subjectName/policy/policyName"
    When a KeyPass "DELETE" petition is asked to PEP
    Then the petition gets to the mock

  @ac_mdw
  Scenario: Create policy
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "/pap/v1/subject/subjectName"
    When a KeyPass "POST" petition is asked to PEP
    Then the petition gets to the mock

  @ac_mdw
  Scenario: List policies
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "/pap/v1/subject/subjectName"
    When a KeyPass "GET" petition is asked to PEP
    Then the petition gets to the mock

  @ac_mdw
  Scenario: Delete subject policies
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "/pap/v1/subject/subjectName"
    When a KeyPass "DELETE" petition is asked to PEP
    Then the petition gets to the mock

  @ac_mdw
  Scenario: Delete tenant policies
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "/pap/v1"
    When a KeyPass "DELETE" petition is asked to PEP
    Then the petition gets to the mock