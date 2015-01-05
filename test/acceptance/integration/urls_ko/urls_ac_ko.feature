# Created by Jon at 05/01/2015
Feature: Urls that not exist in Access Control plugin
  # Enter feature description here

  Background:
    Given the Keypass configuration

  @act2
  Scenario: Test bad URL AC KO
    Given headers
    And a url with "/pap/v1/subjec"
    When the petition action "GET" is asked without data
    Then the Keystone proxy receive the last petition "" from PEP
    And the PEP returns an error

