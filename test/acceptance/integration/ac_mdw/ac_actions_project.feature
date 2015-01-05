# Created by Jon at 18/12/2014
Feature: AC actions when the rol is defined only in a project
  check if all urls of EPB, with the correct permissions in AC, could connect with CEP

  Background:
    Given the Keypass configuration

  @ac_actions_project
  Scenario: Read policy
    Given a domain for project_only in KEYSTONE
    And a without role in domain and with "user_readPolicy_project" user in project
    And a "readPolicy_rol" role in the user project
    And a url with "/pap/v1/subject/subjectName/policy/policyName"
    When a KeyPass "GET" petition is asked to PEP
    Then the petition gets to the mock

  @ac_actions_project
  Scenario: Remove policy
    Given a domain for project_only in KEYSTONE
    And a without role in domain and with "user_removePolicy_project" user in project
    And a "removePolicy_rol" role in the user project
    And a url with "/pap/v1/subject/subjectName/policy/policyName"
    When a KeyPass "DELETE" petition is asked to PEP
    Then the petition gets to the mock

  @ac_actions_project
  Scenario: Create policy
    Given a domain for project_only in KEYSTONE
    And a without role in domain and with "user_createPolicy_project" user in project
    And a "createPolicy_rol" role in the user project
    And a url with "/pap/v1/subject/subjectName"
    When a KeyPass "POST" petition is asked to PEP
    Then the petition gets to the mock

  @ac_actions_project
  Scenario: List policies
    Given a domain for project_only in KEYSTONE
    And a without role in domain and with "user_listPolicies_project" user in project
    And a "listPolicies_rol" role in the user project
    And a url with "/pap/v1/subject/subjectName"
    When a KeyPass "GET" petition is asked to PEP
    Then the petition gets to the mock

  @ac_actions_project
  Scenario: Delete subject policies
    Given a domain for project_only in KEYSTONE
    And a without role in domain and with "user_deleteSubjectPolicies_project" user in project
    And a "deleteSubjectPolicies_rol" role in the user project
    And a url with "/pap/v1/subject/subjectName"
    When a KeyPass "DELETE" petition is asked to PEP
    Then the petition gets to the mock

  @ac_actions_project
  Scenario: Delete tenant policies
    Given a domain for project_only in KEYSTONE
    And a without role in domain and with "user_deleteTenantPolicies_project" user in project
    And a "deleteTenantPolicies_rol" role in the user project
    And a url with "/pap/v1"
    When a KeyPass "DELETE" petition is asked to PEP
    Then the petition gets to the mock