# Created by Jon at 16/12/2014
Feature: CEP actions when the rol is defined only in a project
  Check if all urls of CEP are mapped to the correct action. This action are defined in the project of the user in Keystone

  @cep_actions_project
  Scenario: Notify action
    Given a domain for project_only in KEYSTONE
    And a without role in domain and with "user_notify_project" user in project
    And a "notify_rol" role in the user project
    And a url with "/notices"
    When a CEP "POST" petition is asked to PEP
    Then the petition gets to the mock

  @cep_actions_project
  Scenario Outline: Read Rule action
    Given a domain for project_only in KEYSTONE
    And a without role in domain and with "user_readRule_project" user in project
    And a "readRule_rol" role in the user project
    And a url with "<url>"
    When a CEP "<action>" petition is asked to PEP
    Then the petition gets to the mock
  Examples:
    | url            | action |
    | /rules         | GET    |
    | /rules/id      | GET    |
    | /m2m/vrules    | GET    |
    | /m2m/vrules/id | GET    |

  @cep_actions_project
  Scenario Outline: Write Rule action
    Given a domain for project_only in KEYSTONE
    And a without role in domain and with "user_writeRule_project" user in project
    And a "writeRule_rol" role in the user project
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