# Created by jon at 03/12/2014
Feature: Context broker middleware
  Check if all urls of CB, with the correct user permissions in AC, could connect with CB

  Background:
    Given the Context Broker configuration

  #Standard operations
  @cb_mdwae
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

  @cb_mdwae
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

  @cb_mdwae
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

  @cb_mdwae
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

  @cb_mdwae
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

  @cb_mdwae
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

  @cb_mdwae
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

  @cb_mdwae
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

  @cb_mdwae
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

  @cb_mdwae
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

  @cb_mdwae
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

  @cb_mdwae
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

  @cb_mdwae
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


  @cb_mdwae
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

  @cb_mdwae
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

  @cb_mdwae
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

  @cb_mdwae
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


    
   


