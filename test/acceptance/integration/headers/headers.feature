## Created by Jon at 09/12/2014
Feature: Test request headers
  The environment is set, with one user, with rol in the domain and in a project inside the domain

  Background:
    Given the Headers Context Broker configuration without cache

  @headers
  Scenario Outline: Test incomplete headers CB KO append Action
    Given headers with format "<format>" and "APPEND" action
    And headers without the header "<header>"
    And a url with "/v1/updateContext"
    When the petition action "GET" is asked
    Then the Keystone proxy receive the last petition "<last_petition>" from pep
    And the PEP returns an error with code "<error_code>"

  Examples:
    | header             | format | last_petition | error_code |
    | Fiware-Servicepath | json   |               | 400        |
    | Fiware-Servicepath | xml    |               | 400        |
    | Fiware-Service     | json   |               | 400        |
    | Fiware-Service     | xml    |               | 400        |
    | content-type       | json   |               | 403        |
    | content-type       | xml    |               | 403        |
    | X-Auth-Token       | json   |               | 400        |
    | X-Auth-Token       | xml    |               | 400        |

  @headers
  Scenario Outline: Test incomplete headers CB KO update Action
    Given headers with format "<format>" and "UPDATE" action
    And headers without the header "<header>"
    And a url with "/v1/updateContext"
    When the petition action "GET" is asked
    Then the Keystone proxy receive the last petition "<last_petition>" from pep
    And the PEP returns an error with code "<error_code>"

  Examples:
    | header             | format | last_petition | error_code |
    | Fiware-Servicepath | json   |               | 400        |
    | Fiware-Servicepath | xml    |               | 400        |
    | Fiware-Service     | json   |               | 400        |
    | Fiware-Service     | xml    |               | 400        |
    | content-type       | json   |               | 403        |
    | content-type       | xml    |               | 403        |
    | X-Auth-Token       | json   |               | 400        |
    | X-Auth-Token       | xml    |               | 400        |

  @headers
  Scenario Outline: Test incomplete headers CB KO delete Action
    Given headers with format "<format>" and "DELETE" action
    And headers without the header "<header>"
    And a url with "/v1/updateContext"
    When the petition action "GET" is asked
    Then the Keystone proxy receive the last petition "<last_petition>" from pep
    And the PEP returns an error with code "<error_code>"

  Examples:
    | header             | format | last_petition | error_code |
    | Fiware-Servicepath | json   |               | 400        |
    | Fiware-Servicepath | xml    |               | 400        |
    | Fiware-Service     | json   |               | 400        |
    | Fiware-Service     | xml    |               | 400        |
    | content-type       | json   |               | 403        |
    | content-type       | xml    |               | 403        |
    | X-Auth-Token       | json   |               | 400        |
    | X-Auth-Token       | xml    |               | 400        |


  @headers
  Scenario Outline: Test incomplete headers CB KO read Action
    Given headers with format "<format>"
    And headers without the header "<header>"
    And a url with "/v1/queryContext"
    When the petition action "POST" is asked without data
    Then the Keystone proxy receive the last petition "<last_petition>" from pep
    And the PEP returns an error with code "<error_code>"

  Examples:
    | header             | format | last_petition | error_code |
    | Fiware-Servicepath | json   |               | 400        |
    | Fiware-Servicepath | xml    |               | 400        |
    | Fiware-Service     | json   |               | 400        |
    | Fiware-Service     | xml    |               | 400        |
    | X-Auth-Token       | json   |               | 400        |
    | X-Auth-Token       | xml    |               | 400        |


  @headers
  Scenario Outline: Test bad header CB
    Given headers with format "<format>"
    And header "<header>" inexistent in KEYSTONE
    And a url with "/v1/queryContext"
    When the petition action "POST" is asked without data
    Then the Keystone proxy receive the last petition "<last_petition>" from PEP
    And the PEP returns an error

  Examples:
    | format | header             | last_petition  |
    | json   | Fiware-Service     | v3/auth/tokens |
    | xml    | Fiware-Service     | v3/auth/tokens |
    | json   | Fiware-Servicepath | v3/projects    |
    | xml    | Fiware-Servicepath | v3/projects    |


  @headers
  Scenario Outline: Tests content-type header
    Given headers with format "<format>"
    And the content-type header with the value "<content-type-value>"
    And the payload with the value "<payload>"
    And a url with "/v1/queryContext"
    When the petition action "POST" is asked
    Then the petition gets to the mock

  Examples:
    | format | content-type-value             | payload          |
    | json   | application/json               | {'payload':true} |
    | xml    | application/xml                | <xml></xml>      |
    | xml    | application/xml                | any text         |
    | json   | application/json;charset utf-8 | {'payload':true} |
    | json   | application/xml;charset utf-8  | {'payload':true  |


