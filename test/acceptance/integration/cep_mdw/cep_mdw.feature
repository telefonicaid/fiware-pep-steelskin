# Created by Jon at 16/12/2014
Feature: CEP middleware
  check if all urls of EPB, with the correct permissions in AC, could connect with CEP

  Background:
    Given the Perseo configuration

  @cep_mdw
  Scenario: Notifications urls
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "/notices"
    When a CEP "POST" petition is asked to PEP
    Then the petition gets to the mock

  @cep_mdw
  Scenario Outline: Rules urls
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "<url>"
    When a CEP "<action>" petition is asked to PEP
    Then the petition gets to the mock
  Examples:
    | url       | action |
    | /rules    | GET    |
    | /rules/id | GET    |
    | /rules    | POST   |
    | /rules/id | DELETE |

  @cep_mdw
  Scenario Outline: Visual Rules urls
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "<url>"
    When a CEP "<action>" petition is asked to PEP
    Then the petition gets to the mock
  Examples:
    | url            | action |
    | /m2m/vrules    | GET    |
    | /m2m/vrules/id | GET    |
    | /m2m/vrules    | POST   |
    | /m2m/vrules/id | DELETE |
    | /m2m/vrules/id | PUT    |

  @cep_mdw
  Scenario Outline: Parameters-Query in cep urls
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "<url>"
    When a CEP "<action>" petition is asked to PEP
    Then the petition gets to the mock
  Examples:
    | url                                         | action |
    | /rules?details=on&limit=15&offset=0         | GET    |
    | /rules/id?details=on&limit=15&offset=0      | GET    |
    | /rules?details=on&limit=15&offset=0         | POST   |
    | /rules/id?details=on&limit=15&offset=0      | DELETE |
    | /m2m/vrules?details=on&limit=15&offset=0    | GET    |
    | /m2m/vrules/id?details=on&limit=15&offset=0 | GET    |
    | /m2m/vrules?details=on&limit=15&offset=0    | POST   |
    | /m2m/vrules/id?details=on&limit=15&offset=0 | DELETE |
    | /m2m/vrules/id?details=on&limit=15&offset=0 | PUT    |