# Created by Jon at 05/01/2015
Feature: Urls that not exist in Perseo plugin
  # Enter feature description here

  Background:
    Given the Perseo configuration

  @act
  Scenario: Test bad URL CEP KO
    Given headers
    And a url with "/notis"
    When the petition action "POST" is asked without data
    Then the Keystone proxy receive the last petition "" from PEP
    And the PEP returns an error

