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
# If not, seehttp://www.gnu.org/licenses/.
#
# For those usages not covered by the GNU Affero General Public License
# please contact with::[iot_support@tid.es]
# __author__ = 'Jon Calderin Goñi (jon dot caldering at gmail dot com)'

@cb_mdwae
Feature: Context broker middleware
  Check if all urls of CB, with the correct user permissions in AC, could connect with CB

  Background:
    Given the Context Broker configuration

  #Standard operations
  Scenario Outline: Create Standard operation
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And url with "/v1/updateContext" and the actionType attribute "APPEND"
    When a context broker "POST" petition is asked to PEP with "<format>" format
    Then the petition gets to the mock
  Examples:
    | format |
    | xml    |
    | json   |

  Scenario Outline: Update Standard operation
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And url with "/v1/updateContext" and the actionType attribute "UPDATE"
    When a context broker "POST" petition is asked to PEP with "<format>" format
    Then the petition gets to the mock
  Examples:
    | format |
    | xml    |
    | json   |

  Scenario Outline: Delete Standard operation
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And url with "/v1/updateContext" and the actionType attribute "DELETE"
    When a context broker "POST" petition is asked to PEP with "<format>" format
    Then the petition gets to the mock
  Examples:
    | format |
    | xml    |
    | json   |

  Scenario Outline: Read Standard operation
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "<url>"
    When a context broker "POST" petition is asked to PEP with "<format>" format
    Then the petition gets to the mock
  Examples:
    | format | url              |
    | xml    | /v1/queryContext |
    | json   | /v1/queryContext |
    | xml    | /v1/contextTypes |
    | json   | /v1/contextTypes |

  Scenario Outline: Subscribe Standard operation
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "<url>"
    When a context broker "POST" petition is asked to PEP with "<format>" format
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
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "/v1/registry/registerContext"
    When a context broker "POST" petition is asked to PEP with "<format>" format
    Then the petition gets to the mock
  Examples:
    | format |
    | xml    |
    | json   |

  Scenario Outline: Discover Standard operation
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "/v1/registry/discoverContextAvailability"
    When a context broker "POST" petition is asked to PEP with "<format>" format
    Then the petition gets to the mock
  Examples:
    | format |
    | xml    |
    | json   |

  Scenario Outline: subscribe-availability Standard operation
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "<url>"
    When a context broker "POST" petition is asked to PEP with "<format>" format
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
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "<url>"
    When a context broker "<action>" petition is asked to PEP with "<format>" format
    Then the petition gets to the mock
  Examples:
    | format | url                                                                  | action |
    | xml    | /v1/contextEntities/EntityID                                         | GET    |
    | json   | /v1/contextEntities/EntityID                                         | GET    |
    | xml    | /v1/contextEntities/EntityID/attributes/attributeName                | GET    |
    | json   | /v1/contextEntities/EntityID/attributes/attributeName                | GET    |
    | xml    | /v1/contextEntities/EntityID/attributes/attributeName/valueID        | GET    |
    | json   | /v1/contextEntities/EntityID/attributes/attributeName/valueID        | GET    |
    | xml    | /v1/contextEntities/EntityID/attributeDomains/attributeDomainName    | GET    |
    | json   | /v1/contextEntities/EntityID/attributeDomains/attributeDomainName    | GET    |
    | xml    | /v1/contextEntityTypes/typeName/attributes/attributeName             | GET    |
    | json   | /v1/contextEntityTypes/typeName/attributes/attributeName             | GET    |
    | xml    | /v1/contextEntityTypes/typeName/attributeDomains/attributeDomainName | GET    |
    | json   | /v1/contextEntityTypes/typeName/attributeDomains/attributeDomainName | GET    |
    | xml    | /v1/contextEntityTypes/typeName                                      | GET    |
    | json   | /v1/contextEntityTypes/typeName                                      | GET    |
    | xml    | /v1/contextEntities                                                  | GET    |
    | json   | /v1/contextEntities                                                  | GET    |
    | xml    | /v1/contextSubscriptions                                             | GET    |
    | json   | /v1/contextSubscriptions                                             | GET    |
    | xml    | /v1/contextSubscriptions/subscriptionid                              | GET    |
    | json   | /v1/contextSubscriptions/subscriptionid                              | GET    |
    | xml    | /v1/contextTypes                                                     | GET    |
    | json   | /v1/contextTypes                                                     | GET    |
    | xml    | /v1/contextTypes/typeName                                            | GET    |
    | json   | /v1/contextTypes/typeName                                            | GET    |

  Scenario Outline: Update Convenience operation
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "<url>"
    When a context broker "<action>" petition is asked to PEP with "<format>" format
    Then the petition gets to the mock
  Examples:
    | format | url                                                           | action |
    | xml    | /v1/contextEntities/EntityID                                  | PUT    |
    | json   | /v1/contextEntities/EntityID                                  | PUT    |
    | xml    | /v1/contextEntities/EntityID/attributes/attributeName         | PUT    |
    | json   | /v1/contextEntities/EntityID/attributes/attributeName         | PUT    |
    | xml    | /v1/contextEntities/EntityID/attributes/attributeName/valueID | PUT    |
    | json   | /v1/contextEntities/EntityID/attributes/attributeName/valueID | PUT    |

  Scenario Outline: Create Convenience operation
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "<url>"
    When a context broker "<action>" petition is asked to PEP with "<format>" format
    Then the petition gets to the mock
  Examples:
    | format | url                                                   | action |
    | xml    | /v1/contextEntities/EntityID                          | POST   |
    | json   | /v1/contextEntities/EntityID                          | POST   |
    | xml    | /v1/contextEntities/EntityID/attributes/attributeName | POST   |
    | json   | /v1/contextEntities/EntityID/attributes/attributeName | POST   |
    | xml    | /v1/contextEntities                                   | POST   |
    | json   | /v1/contextEntities                                   | POST   |

  Scenario Outline: Subscribe Convenience operation
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "<url>"
    When a context broker "<action>" petition is asked to PEP with "<format>" format
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
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "<url>"
    When a context broker "<action>" petition is asked to PEP with "<format>" format
    Then the petition gets to the mock
  Examples:
    | format | url                                                                           | action |
    | xml    | /v1/registry/contextEntities/EntityID                                         | GET    |
    | json   | /v1/registry/contextEntities/EntityID                                         | GET    |
    | xml    | /v1/registry/contextEntities/EntityID/attributes/attributeName                | GET    |
    | json   | /v1/registry/contextEntities/EntityID/attributes/attributeName                | GET    |
    | xml    | /v1/registry/contextEntities/EntityID/attributeDomains/attributeDomainName    | GET    |
    | json   | /v1/registry/contextEntities/EntityID/attributeDomains/attributeDomainName    | GET    |
    | xml    | /v1/registry/contextEntityTypes/typeName/attributes/attributeName             | GET    |
    | json   | /v1/registry/contextEntityTypes/typeName/attributes/attributeName             | GET    |
    | xml    | /v1/registry/contextEntityTypes/typeName/attributeDomains/attributeDomainName | GET    |
    | json   | /v1/registry/contextEntityTypes/typeName/attributeDomains/attributeDomainName | GET    |
    | xml    | /v1/registry/contextEntityTypes/typeName                                      | GET    |
    | json   | /v1/registry/contextEntityTypes/typeName                                      | GET    |


  Scenario Outline: Register Convenience operation
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "<url>"
    When a context broker "<action>" petition is asked to PEP with "<format>" format
    Then the petition gets to the mock
  Examples:
    | format | url                                                                           | action |
    | xml    | /v1/registry/contextEntities/EntityID                                         | POST   |
    | json   | /v1/registry/contextEntities/EntityID                                         | POST   |
    | xml    | /v1/registry/contextEntities/EntityID/attributes/attributeName                | POST   |
    | json   | /v1/registry/contextEntities/EntityID/attributes/attributeName                | POST   |
    | xml    | /v1/registry/contextEntities/EntityID/attributeDomains/attributeDomainName    | POST   |
    | json   | /v1/registry/contextEntities/EntityID/attributeDomains/attributeDomainName    | POST   |
    | xml    | /v1/registry/contextEntityTypes/typeName/attributes/attributeName             | POST   |
    | json   | /v1/registry/contextEntityTypes/typeName/attributes/attributeName             | POST   |
    | xml    | /v1/registry/contextEntityTypes/typeName/attributeDomains/attributeDomainName | POST   |
    | json   | /v1/registry/contextEntityTypes/typeName/attributeDomains/attributeDomainName | POST   |
    | xml    | /v1/registry/contextEntityTypes/typeName                                      | POST   |
    | json   | /v1/registry/contextEntityTypes/typeName                                      | POST   |

  Scenario Outline: Subscribe-availability Convenience operation
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "<url>"
    When a context broker "<action>" petition is asked to PEP with "<format>" format
    Then the petition gets to the mock
  Examples:
    | format | url                                                          | action |
    | xml    | /v1/registry/contextAvailabilitySubscriptions                | POST   |
    | json   | /v1/registry/contextAvailabilitySubscriptions                | POST   |
    | xml    | /v1/registry/contextAvailabilitySubscriptions/subscriptionId | PUT    |
    | json   | /v1/registry/contextAvailabilitySubscriptions/subscriptionId | PUT    |
    | xml    | /v1/registry/contextAvailabilitySubscriptions/subscriptionId | DELETE |
    | json   | /v1/registry/contextAvailabilitySubscriptions/subscriptionId | DELETE |

  Scenario Outline: Parameters-Query in cb urls with operation in the payload
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And url with "/v1/updateContext?details=on&limit=15&offset=0" and the actionType attribute "<attribute>"
    When a context broker "POST" petition is asked to PEP with "<format>" format
    Then the petition gets to the mock
  Examples:
    | format | attribute |
    | xml    | UPDATE    |
    | json   | UPDATE    |
    | xml    | APPEND    |
    | json   | APPEND    |
    | xml    | DELETE    |
    | json   | DELETE    |

  Scenario Outline: Parameters-Query in cb urls
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "<url>"
    When a context broker "<action>" petition is asked to PEP with "<format>" format
    Then the petition gets to the mock
  Examples:
    | format | url                                                                                                        | action |
    | xml    | /v1/registry/contextAvailabilitySubscriptions?details=on&limit=15&offset=0                                 | POST   |
    | json   | /v1/registry/contextAvailabilitySubscriptions?details=on&limit=15&offset=0                                 | POST   |
    | xml    | /v1/registry/contextAvailabilitySubscriptions/subscriptionId?details=on&limit=15&offset=0                  | PUT    |
    | json   | /v1/registry/contextAvailabilitySubscriptions/subscriptionId?details=on&limit=15&offset=0                  | PUT    |
    | xml    | /v1/registry/contextAvailabilitySubscriptions/subscriptionId?details=on&limit=15&offset=0                  | DELETE |
    | json   | /v1/registry/contextAvailabilitySubscriptions/subscriptionId?details=on&limit=15&offset=0                  | DELETE |
    | xml    | /v1/registry/contextEntities/EntityID?details=on&limit=15&offset=0                                         | POST   |
    | json   | /v1/registry/contextEntities/EntityID?details=on&limit=15&offset=0                                         | POST   |
    | xml    | /v1/registry/contextEntities/EntityID/attributes/attributeName?details=on&limit=15&offset=0                | POST   |
    | json   | /v1/registry/contextEntities/EntityID/attributes/attributeName?details=on&limit=15&offset=0                | POST   |
    | xml    | /v1/registry/contextEntities/EntityID/attributeDomains/attributeDomainName?details=on&limit=15&offset=0    | POST   |
    | json   | /v1/registry/contextEntities/EntityID/attributeDomains/attributeDomainName?details=on&limit=15&offset=0    | POST   |
    | xml    | /v1/registry/contextEntityTypes/typeName/attributes/attributeName?details=on&limit=15&offset=0             | POST   |
    | json   | /v1/registry/contextEntityTypes/typeName/attributes/attributeName?details=on&limit=15&offset=0             | POST   |
    | xml    | /v1/registry/contextEntityTypes/typeName/attributeDomains/attributeDomainName?details=on&limit=15&offset=0 | POST   |
    | json   | /v1/registry/contextEntityTypes/typeName/attributeDomains/attributeDomainName?details=on&limit=15&offset=0 | POST   |
    | xml    | /v1/registry/contextEntityTypes/typeName?details=on&limit=15&offset=0                                      | POST   |
    | json   | /v1/registry/contextEntityTypes/typeName?details=on&limit=15&offset=0                                      | POST   |
    | xml    | /v1/registry/contextEntities/EntityID?details=on&limit=15&offset=0                                         | GET    |
    | json   | /v1/registry/contextEntities/EntityID?details=on&limit=15&offset=0                                         | GET    |
    | xml    | /v1/registry/contextEntities/EntityID/attributes/attributeName?details=on&limit=15&offset=0                | GET    |
    | json   | /v1/registry/contextEntities/EntityID/attributes/attributeName?details=on&limit=15&offset=0                | GET    |
    | xml    | /v1/registry/contextEntities/EntityID/attributeDomains/attributeDomainName?details=on&limit=15&offset=0    | GET    |
    | json   | /v1/registry/contextEntities/EntityID/attributeDomains/attributeDomainName?details=on&limit=15&offset=0    | GET    |
    | xml    | /v1/registry/contextEntityTypes/typeName/attributes/attributeName?details=on&limit=15&offset=0             | GET    |
    | json   | /v1/registry/contextEntityTypes/typeName/attributes/attributeName?details=on&limit=15&offset=0             | GET    |
    | xml    | /v1/registry/contextEntityTypes/typeName/attributeDomains/attributeDomainName?details=on&limit=15&offset=0 | GET    |
    | json   | /v1/registry/contextEntityTypes/typeName/attributeDomains/attributeDomainName?details=on&limit=15&offset=0 | GET    |
    | xml    | /v1/registry/contextEntityTypes/typeName?details=on&limit=15&offset=0                                      | GET    |
    | json   | /v1/registry/contextEntityTypes/typeName?details=on&limit=15&offset=0                                      | GET    |
    | xml    | /v1/contextSubscriptions?details=on&limit=15&offset=0                                                      | POST   |
    | json   | /v1/contextSubscriptions?details=on&limit=15&offset=0                                                      | POST   |
    | xml    | /v1/contextSubscriptions/subscriptionID?details=on&limit=15&offset=0                                       | PUT    |
    | json   | /v1/contextSubscriptions/subscriptionID?details=on&limit=15&offset=0                                       | PUT    |
    | xml    | /v1/contextSubscriptions/subscriptionID?details=on&limit=15&offset=0                                       | DELETE |
    | json   | /v1/contextSubscriptions/subscriptionID?details=on&limit=15&offset=0                                       | DELETE |
    | xml    | /v1/contextEntities/EntityID?details=on&limit=15&offset=0                                                  | POST   |
    | json   | /v1/contextEntities/EntityID?details=on&limit=15&offset=0                                                  | POST   |
    | xml    | /v1/contextEntities/EntityID/attributes/attributeName?details=on&limit=15&offset=0                         | POST   |
    | json   | /v1/contextEntities/EntityID/attributes/attributeName?details=on&limit=15&offset=0                         | POST   |
    | xml    | /v1/contextEntities/EntityID?details=on&limit=15&offset=0                                                  | PUT    |
    | json   | /v1/contextEntities/EntityID?details=on&limit=15&offset=0                                                  | PUT    |
    | xml    | /v1/contextEntities/EntityID/attributes/attributeName?details=on&limit=15&offset=0                         | PUT    |
    | json   | /v1/contextEntities/EntityID/attributes/attributeName?details=on&limit=15&offset=0                         | PUT    |
    | xml    | /v1/contextEntities/EntityID/attributes/attributeName/valueID?details=on&limit=15&offset=0                 | PUT    |
    | json   | /v1/contextEntities/EntityID/attributes/attributeName/valueID?details=on&limit=15&offset=0                 | PUT    |
    | xml    | /v1/contextEntities/EntityID?details=on&limit=15&offset=0                                                  | GET    |
    | json   | /v1/contextEntities/EntityID?details=on&limit=15&offset=0                                                  | GET    |
    | xml    | /v1/contextEntities/EntityID/attributes/attributeName?details=on&limit=15&offset=0                         | GET    |
    | json   | /v1/contextEntities/EntityID/attributes/attributeName?details=on&limit=15&offset=0                         | GET    |
    | xml    | /v1/contextEntities/EntityID/attributes/attributeName/valueID?details=on&limit=15&offset=0                 | GET    |
    | json   | /v1/contextEntities/EntityID/attributes/attributeName/valueID?details=on&limit=15&offset=0                 | GET    |
    | xml    | /v1/contextEntities/EntityID/attributeDomains/attributeDomainName?details=on&limit=15&offset=0             | GET    |
    | json   | /v1/contextEntities/EntityID/attributeDomains/attributeDomainName?details=on&limit=15&offset=0             | GET    |
    | xml    | /v1/contextEntityTypes/typeName/attributes/attributeName?details=on&limit=15&offset=0                      | GET    |
    | json   | /v1/contextEntityTypes/typeName/attributes/attributeName?details=on&limit=15&offset=0                      | GET    |
    | xml    | /v1/contextEntityTypes/typeName/attributeDomains/attributeDomainName?details=on&limit=15&offset=0          | GET    |
    | json   | /v1/contextEntityTypes/typeName/attributeDomains/attributeDomainName?details=on&limit=15&offset=0          | GET    |
    | xml    | /v1/contextEntityTypes/typeName?details=on&limit=15&offset=0                                               | GET    |
    | json   | /v1/contextEntityTypes/typeName?details=on&limit=15&offset=0                                               | GET    |
    | xml    | /v1/registry/subscribeContextAvailability?details=on&limit=15&offset=0                                     | POST   |
    | json   | /v1/registry/subscribeContextAvailability?details=on&limit=15&offset=0                                     | POST   |
    | xml    | /v1/registry/updateContextAvailabilitySubscription?details=on&limit=15&offset=0                            | POST   |
    | json   | /v1/registry/updateContextAvailabilitySubscription?details=on&limit=15&offset=0                            | POST   |
    | xml    | /v1/registry/unsubscribeContextAvailability?details=on&limit=15&offset=0                                   | POST   |
    | json   | /v1/registry/unsubscribeContextAvailability?details=on&limit=15&offset=0                                   | POST   |
    | xml    | /v1/registry/discoverContextAvailability?details=on&limit=15&offset=0                                      | POST   |
    | json   | /v1/registry/discoverContextAvailability?details=on&limit=15&offset=0                                      | POST   |
    | xml    | /v1/registry/registerContext?details=on&limit=15&offset=0                                                  | POST   |
    | json   | /v1/registry/registerContext?details=on&limit=15&offset=0                                                  | POST   |
    | xml    | /v1/subscribeContext?details=on&limit=15&offset=0                                                          | POST   |
    | json   | /v1/subscribeContext?details=on&limit=15&offset=0                                                          | POST   |
    | xml    | /v1/updateContextSubscription?details=on&limit=15&offset=0                                                 | POST   |
    | json   | /v1/updateContextSubscription?details=on&limit=15&offset=0                                                 | POST   |
    | xml    | /v1/unsubscribeContext?details=on&limit=15&offset=0                                                        | POST   |
    | json   | /v1/unsubscribeContext?details=on&limit=15&offset=0                                                        | POST   |
    | xml    | /v1/queryContext?details=on&limit=15&offset=0                                                              | POST   |
    | json   | /v1/queryContext?details=on&limit=15&offset=0                                                              | POST   |
    | xml    | /v1/contextTypes?details=on&limit=15&offset=0                                                              | GET    |
    | json   | /v1/contextTypes?details=on&limit=15&offset=0                                                              | GET    |


    
   


