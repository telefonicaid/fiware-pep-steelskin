# Created by Jon at 05/01/2015
Feature: Urls that not exist in ContextBroker plugin
  # Enter feature description here

  Background:
    Given the Context Broker configuration

  @urls_cb_ko
  Scenario Outline: Test bad URL CB KO
    Given headers with format "<format>"
    And a url with "v1/queryContex"
    When the petition action "POST" is asked without data
    Then the Keystone proxy receive the last petition "<last_petition>" from PEP
    And the PEP returns an error

  Examples:
    | format | last_petition |
    | json   |               |
    | xml    |               |