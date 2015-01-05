# Created by Jon at 18/12/2014
Feature: AC actions when the rol is defined only in the domain
  check if all urls of EPB, with the correct permissions in AC, could connect with CEP

  Background:
    Given the Keypass configuration

  @ac_actions_domain
  Scenario: Read policy
    Given a domain without projects in KEYSTONE
    And a "user_readPolicy_domain" user in domain without projects
    And a "readPolicy_rol" role in the user and domain
    And a url with "/pap/v1/subject/subjectName/policy/policyName"
    When a KeyPass "GET" petition is asked to PEP
    Then the petition gets to the mock

  @ac_actions_domain
  Scenario: Remove policy
    Given a domain without projects in KEYSTONE
    And a "user_removePolicy_domain" user in domain without projects
    And a "removePolicy_rol" role in the user and domain
    And a url with "/pap/v1/subject/subjectName/policy/policyName"
    When a KeyPass "DELETE" petition is asked to PEP
    Then the petition gets to the mock

  @ac_actions_domain
  Scenario: Create policy
    Given a domain without projects in KEYSTONE
    And a "user_createPolicy_domain" user in domain without projects
    And a "createPolicy_rol" role in the user and domain
    And a url with "/pap/v1/subject/subjectName"
    When a KeyPass "POST" petition is asked to PEP
    Then the petition gets to the mock

  @ac_actions_domain
  Scenario: List policies
    Given a domain without projects in KEYSTONE
    And a "user_listPolicies_domain" user in domain without projects
    And a "listPolicies_rol" role in the user and domain
    And a url with "/pap/v1/subject/subjectName"
    When a KeyPass "GET" petition is asked to PEP
    Then the petition gets to the mock

  @ac_actions_domain
  Scenario: Delete subject policies
    Given a domain without projects in KEYSTONE
    And a "user_deleteSubjectPolicies_domain" user in domain without projects
    And a "deleteSubjectPolicies_rol" role in the user and domain
    And a url with "/pap/v1/subject/subjectName"
    When a KeyPass "DELETE" petition is asked to PEP
    Then the petition gets to the mock

  @ac_actions_domain
  Scenario: Delete tenant policies
    Given a domain without projects in KEYSTONE
    And a "user_deleteTenantPolicies_domain" user in domain without projects
    And a "deleteTenantPolicies_rol" role in the user and domain
    And a url with "/pap/v1"
    When a KeyPass "DELETE" petition is asked to PEP
    Then the petition gets to the mock