## Created by Jon at 09/12/2014
Feature: Test request headers
#  The environment is set, with one user, with rol in the domain and in a project inside the domain
#
#  Scenario Outline: Test headers ok
#    Given an user logged in KEYSTONE
#      | <user> | <password> | <Fiware-Service>
#    When PEP gets a request with the headers
#      | <Fiware-Servicepath> | <Fiware-Service> |
#    Then PEP ask to KEYSTONE for the information
#  Examples:
#    | user    | password | Fiware-Servicepath | Fiware-Service |
#    | octopus | octopus  | /coral             | atlantic       |
#    | octopus | octopus  | /                  | atlantic       |
#
#
#  Scenario Outline: Test headers ok
#    Given the token "<token>"
#    And the subservice "<Fiware-Servicepath>"
#    And the service "<Fiware-Service>"
#    When request is made to PEP
#    Then PEP sends the information to keystone
#  Examples:
#    | token   | Fiware-Servicepath | Fiware-Service |
#    | token_1 | /                  | service        |