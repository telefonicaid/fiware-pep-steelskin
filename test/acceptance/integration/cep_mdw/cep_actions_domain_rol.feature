# Created by Jon at 16/12/2014
Feature: CEP actions when the rol is defined only in the domain
  Check if all urls of CEP are mapped to the correct action. This actions are defined in the domain of the user in Keystone

  @cep_actions_domain
  Scenario: Notify action
    Given a domain without projects in KEYSTONE
    And a "user_notify_domain" user in domain without projects
    And a "notify_rol" role in the user and domain
    And a url with "/notices"
    When a CEP "POST" petition is asked to PEP
    Then the petition gets to the mock

  @cep_actions_domain
  Scenario Outline: Read Rule action
    Given a domain without projects in KEYSTONE
    And a "user_readRule_domain" user in domain without projects
    And a "readRule_rol" role in the user and domain
    And a url with "<url>"
    When a CEP "<action>" petition is asked to PEP
    Then the petition gets to the mock
  Examples:
    | url            | action |
    | /rules         | GET    |
    | /rules/id      | GET    |
    | /m2m/vrules    | GET    |
    | /m2m/vrules/id | GET    |

  @cep_actions_domain
  Scenario Outline: Write Rule action
    Given a domain without projects in KEYSTONE
    And a "user_writeRule_domain" user in domain without projects
    And a "writeRule_rol" role in the user and domain
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