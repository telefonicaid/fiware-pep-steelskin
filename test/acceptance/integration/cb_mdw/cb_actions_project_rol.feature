# Copyright 2014 Telefonica Investigación y Desarrollo, S.A.U
#
# This file is part of fiware-orion-pep
#
# fiware-orion-pep is free software: you can redistribute it and/or
# modify it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the License,
# or (at your option) any later version.
#
# fiware-orion-pep is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
# See the GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public
# License along with fiware-orion-pep.
# If not, see http://www.gnu.org/licenses/.
#
# For those usages not covered by the GNU Affero General Public License
# please contact with::[iot_support@tid.es]
# __author__ = 'Jon Calderin Goñi (jon dot caldering at gmail dot com)'

@cb_actions_project_rol
Feature: Context broker actions when the role is defined only in a project
  Check if all urls of CB are mapped to the correct action. This action are defined in the project of the user in Keystone

  Background:
    Given the Context Broker configuration

  #Standard operations
  Scenario Outline: Create Standard operation
    Given a Keystone configuration with roles in projects and the user "user_create_project"
    And build a PEP url with the path "/v1/updateContext"
    And headers build with the information set before and with format "<format>"
    And add to the payload the Context Broker action "APPEND" with format "<format>"
    And a "POST" request is built with the previous data
    When the request built before is sent to PEP
    Then the petition gets to the mock
  Examples:
    | format |
    | xml    |
    | json   |

  Scenario Outline: Update Standard operation
    Given a Keystone configuration with roles in projects and the user "user_update_project"
    And build a PEP url with the path "/v1/updateContext"
    And headers build with the information set before and with format "<format>"
    And add to the payload the Context Broker action "UPDATE" with format "<format>"
    And a "POST" request is built with the previous data
    When the request built before is sent to PEP
    Then the petition gets to the mock
  Examples:
    | format |
    | xml    |
    | json   |

  Scenario Outline: Delete Standard operation
    Given a Keystone configuration with roles in projects and the user "user_delete_project"
    And build a PEP url with the path "/v1/updateContext"
    And headers build with the information set before and with format "<format>"
    And add to the payload the Context Broker action "DELETE" with format "<format>"
    And a "POST" request is built with the previous data
    When the request built before is sent to PEP
    Then the petition gets to the mock
  Examples:
    | format |
    | xml    |
    | json   |

  Scenario Outline: Read Standard operation
    Given a Keystone configuration with roles in projects and the user "user_read_project"
    And build a PEP url with the path "<url>"
    And headers build with the information set before and with format "<format>"
    And add an example of payload with "<format>" format
    And a "POST" request is built with the previous data
    When the request built before is sent to PEP
    Then the petition gets to the mock
  Examples:
    | format | url              |
    | xml    | /v1/queryContext |
    | json   | /v1/queryContext |
    | xml    | /v1/contextTypes |
    | json   | /v1/contextTypes |

  Scenario Outline: Subscribe Standard operation
    Given a Keystone configuration with roles in projects and the user "user_subscribe_project"
    And build a PEP url with the path "<url>"
    And headers build with the information set before and with format "<format>"
    And add an example of payload with "<format>" format
    And a "POST" request is built with the previous data
    When the request built before is sent to PEP
    Then the petition gets to the mock
  Examples:
    | format | url                           |
    | xml    | /v1/subscribeContext          |
    | json   | /v1/subscribeContext          |
    | xml    | /v1/updateContextSubscription |
    | json   | /v1/updateContextSubscription |
    | xml    | /v1/unsubscribeContext        |
    | json   | /v1/unsubscribeContext        |

  Scenario Outline: Register Standard operation
    Given a Keystone configuration with roles in projects and the user "user_register_project"
    And build a PEP url with the path "/v1/registry/registerContext"
    And headers build with the information set before and with format "<format>"
    And add an example of payload with "<format>" format
    And a "POST" request is built with the previous data
    When the request built before is sent to PEP
    Then the petition gets to the mock
  Examples:
    | format |
    | xml    |
    | json   |

  Scenario Outline: Discover Standard operation
    Given a Keystone configuration with roles in projects and the user "user_discover_project"
    And build a PEP url with the path "/v1/registry/discoverContextAvailability"
    And headers build with the information set before and with format "<format>"
    And add an example of payload with "<format>" format
    And a "POST" request is built with the previous data
    When the request built before is sent to PEP
    Then the petition gets to the mock
  Examples:
    | format |
    | xml    |
    | json   |

  Scenario Outline: subscribe-availability Standard operation
    Given a Keystone configuration with roles in projects and the user "user_subscribe-availability_project"
    And build a PEP url with the path "<url>"
    And headers build with the information set before and with format "<format>"
    And add an example of payload with "<format>" format
    And a "POST" request is built with the previous data
    When the request built before is sent to PEP
    Then the petition gets to the mock
  Examples:
    | format | url                                                |
    | xml    | /v1/registry/subscribeContextAvailability          |
    | json   | /v1/registry/subscribeContextAvailability          |
    | xml    | /v1/registry/updateContextAvailabilitySubscription |
    | json   | /v1/registry/updateContextAvailabilitySubscription |
    | xml    | /v1/registry/unsubscribeContextAvailability        |
    | json   | /v1/registry/unsubscribeContextAvailability        |

  #Convenience operations
  Scenario Outline: Read Convenience operation
    Given a Keystone configuration with roles in projects and the user "user_read_project"
    And build a PEP url with the path "<url>"
    And headers build with the information set before and with format "<format>"
    And add an example of payload with "<format>" format
    And a "GET" request is built with the previous data
    When the request built before is sent to PEP
    Then the petition gets to the mock
  Examples:
    | format | url                                                                  |
    | xml    | /v1/contextEntities/EntityID                                         |
    | json   | /v1/contextEntities/EntityID                                         |
    | xml    | /v1/contextEntities/EntityID/attributes/attributeName                |
    | json   | /v1/contextEntities/EntityID/attributes/attributeName                |
    | xml    | /v1/contextEntities/EntityID/attributes/attributeName/valueID        |
    | json   | /v1/contextEntities/EntityID/attributes/attributeName/valueID        |
    | xml    | /v1/contextEntities/EntityID/attributeDomains/attributeDomainName    |
    | json   | /v1/contextEntities/EntityID/attributeDomains/attributeDomainName    |
    | xml    | /v1/contextEntityTypes/typeName/attributes/attributeName             |
    | json   | /v1/contextEntityTypes/typeName/attributes/attributeName             |
    | xml    | /v1/contextEntityTypes/typeName/attributeDomains/attributeDomainName |
    | json   | /v1/contextEntityTypes/typeName/attributeDomains/attributeDomainName |
    | xml    | /v1/contextEntityTypes/typeName                                      |
    | json   | /v1/contextEntityTypes/typeName                                      |
    | xml    | /v1/contextEntities                                                  |
    | json   | /v1/contextEntities                                                  |
    | xml    | /v1/contextSubscriptions                                             |
    | json   | /v1/contextSubscriptions                                             |
    | xml    | /v1/contextSubscriptions/subscriptionid                              |
    | json   | /v1/contextSubscriptions/subscriptionid                              |
    | xml    | /v1/contextTypes                                                     |
    | json   | /v1/contextTypes                                                     |
    | xml    | /v1/contextTypes/typeName                                            |
    | json   | /v1/contextTypes/typeName                                            |

  Scenario Outline: Update Convenience operation
    Given a Keystone configuration with roles in projects and the user "user_update_project"
    And build a PEP url with the path "<url>"
    And headers build with the information set before and with format "<format>"
    And add an example of payload with "<format>" format
    And a "PUT" request is built with the previous data
    When the request built before is sent to PEP
    Then the petition gets to the mock
  Examples:
    | format | url                                                           |
    | xml    | /v1/contextEntities/EntityID                                  |
    | json   | /v1/contextEntities/EntityID                                  |
    | xml    | /v1/contextEntities/EntityID/attributes/attributeName         |
    | json   | /v1/contextEntities/EntityID/attributes/attributeName         |
    | xml    | /v1/contextEntities/EntityID/attributes/attributeName/valueID |
    | json   | /v1/contextEntities/EntityID/attributes/attributeName/valueID |

  Scenario Outline: Create Convenience operation
    Given a Keystone configuration with roles in projects and the user "user_create_project"
    And build a PEP url with the path "<url>"
    And headers build with the information set before and with format "<format>"
    And add an example of payload with "<format>" format
    And a "POST" request is built with the previous data
    When the request built before is sent to PEP
    Then the petition gets to the mock
  Examples:
    | format | url                                                   |
    | xml    | /v1/contextEntities/EntityID                          |
    | json   | /v1/contextEntities/EntityID                          |
    | xml    | /v1/contextEntities/EntityID/attributes/attributeName |
    | json   | /v1/contextEntities/EntityID/attributes/attributeName |

  Scenario Outline: Subscribe Convenience operation
    Given a Keystone configuration with roles in projects and the user "user_subscribe_project"
    And build a PEP url with the path "<url>"
    And headers build with the information set before and with format "<format>"
    And add an example of payload with "<format>" format
    And a "<action>" request is built with the previous data
    When the request built before is sent to PEP
    Then the petition gets to the mock
  Examples:
    | format | url                                     | action |
    | xml    | /v1/contextSubscriptions                | POST   |
    | json   | /v1/contextSubscriptions                | POST   |
    | xml    | /v1/contextSubscriptions/subscriptionID | PUT    |
    | json   | /v1/contextSubscriptions/subscriptionID | PUT    |
    | xml    | /v1/contextSubscriptions/subscriptionID | DELETE |
    | json   | /v1/contextSubscriptions/subscriptionID | DELETE |

  Scenario Outline: Discover Convenience operation
    Given a Keystone configuration with roles in projects and the user "user_discover_project"
    And build a PEP url with the path "<url>"
    And headers build with the information set before and with format "<format>"
    And add an example of payload with "<format>" format
    And a "GET" request is built with the previous data
    When the request built before is sent to PEP
    Then the petition gets to the mock
  Examples:
    | format | url                                                                           |
    | xml    | /v1/registry/contextEntities/EntityID                                         |
    | json   | /v1/registry/contextEntities/EntityID                                         |
    | xml    | /v1/registry/contextEntities/EntityID/attributes/attributeName                |
    | json   | /v1/registry/contextEntities/EntityID/attributes/attributeName                |
    | xml    | /v1/registry/contextEntities/EntityID/attributeDomains/attributeDomainName    |
    | json   | /v1/registry/contextEntities/EntityID/attributeDomains/attributeDomainName    |
    | xml    | /v1/registry/contextEntityTypes/typeName/attributes/attributeName             |
    | json   | /v1/registry/contextEntityTypes/typeName/attributes/attributeName             |
    | xml    | /v1/registry/contextEntityTypes/typeName/attributeDomains/attributeDomainName |
    | json   | /v1/registry/contextEntityTypes/typeName/attributeDomains/attributeDomainName |
    | xml    | /v1/registry/contextEntityTypes/typeName                                      |
    | json   | /v1/registry/contextEntityTypes/typeName                                      |

  Scenario Outline: Register Convenience operation
    Given a Keystone configuration with roles in projects and the user "user_register_project"
    And build a PEP url with the path "<url>"
    And headers build with the information set before and with format "<format>"
    And add an example of payload with "<format>" format
    And a "POST" request is built with the previous data
    When the request built before is sent to PEP
    Then the petition gets to the mock
  Examples:
    | format | url                                                                           |
    | xml    | /v1/registry/contextEntities/EntityID                                         |
    | json   | /v1/registry/contextEntities/EntityID                                         |
    | xml    | /v1/registry/contextEntities/EntityID/attributes/attributeName                |
    | json   | /v1/registry/contextEntities/EntityID/attributes/attributeName                |
    | xml    | /v1/registry/contextEntities/EntityID/attributeDomains/attributeDomainName    |
    | json   | /v1/registry/contextEntities/EntityID/attributeDomains/attributeDomainName    |
    | xml    | /v1/registry/contextEntityTypes/typeName/attributes/attributeName             |
    | json   | /v1/registry/contextEntityTypes/typeName/attributes/attributeName             |
    | xml    | /v1/registry/contextEntityTypes/typeName/attributeDomains/attributeDomainName |
    | json   | /v1/registry/contextEntityTypes/typeName/attributeDomains/attributeDomainName |
    | xml    | /v1/registry/contextEntityTypes/typeName                                      |
    | json   | /v1/registry/contextEntityTypes/typeName                                      |

  Scenario Outline: Subscribe-availability Convenience operation
    Given a Keystone configuration with roles in projects and the user "user_subscribe-availability_project"
    And build a PEP url with the path "<url>"
    And headers build with the information set before and with format "<format>"
    And add an example of payload with "<format>" format
    And a "<action>" request is built with the previous data
    When the request built before is sent to PEP
    Then the petition gets to the mock
  Examples:
    | format | url                                                          | action |
    | xml    | /v1/registry/contextAvailabilitySubscriptions                | POST   |
    | json   | /v1/registry/contextAvailabilitySubscriptions                | POST   |
    | xml    | /v1/registry/contextAvailabilitySubscriptions/subscriptionId | PUT    |
    | json   | /v1/registry/contextAvailabilitySubscriptions/subscriptionId | PUT    |
    | xml    | /v1/registry/contextAvailabilitySubscriptions/subscriptionId | DELETE |
    | json   | /v1/registry/contextAvailabilitySubscriptions/subscriptionId | DELETE |






