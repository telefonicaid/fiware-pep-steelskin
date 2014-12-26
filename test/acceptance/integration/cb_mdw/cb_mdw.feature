# Created by jon at 03/12/2014
Feature: Context broker middleware
  Check if all urls of CB, with the correct user permissions in AC, could connect with CB

  #Standard operations
  @cb_mdwae @act2
  Scenario Outline: Create Standard operation
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And url with "v1/updateContext" and the actionType attribute "APPEND"
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
    And url with "v1/updateContext" and the actionType attribute "UPDATE"
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
    And url with "v1/updateContext" and the actionType attribute "DELETE"
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
    And a url with "v1/queryContext"
    When a context broker "POST" petition is asked to PEP with "<format>" format
    Then the petition gets to the mock
  Examples:
    | format |
    | xml    |
    | json   |

  @cb_mdwae
  Scenario Outline: Subscribe Standard operation
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "<url>"
    When a context broker "POST" petition is asked to PEP with "<format>" format
    Then the petition gets to the mock
  Examples:
    | format | url                          |
    | xml    | v1/subscribeContext          |
    | json   | v1/subscribeContext          |
    | xml    | v1/updateContextSubscription |
    | json   | v1/updateContextSubscription |
    | xml    | v1/unsubscribeContext        |
    | json   | v1/unsubscribeContext        |

  @cb_mdwae
  Scenario Outline: Register Standard operation
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "v1/registry/registerContext"
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
    And a url with "v1/registry/discoverContextAvailability"
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
    | format | url                                               |
    | xml    | v1/registry/subscribeContextAvailability          |
    | json   | v1/registry/subscribeContextAvailability          |
    | xml    | v1/registry/updateContextAvailabilitySubscription |
    | json   | v1/registry/updateContextAvailabilitySubscription |
    | xml    | v1/registry/unsubscribeContextAvailability        |
    | json   | v1/registry/unsubscribeContextAvailability        |

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
    | format | url                                                                 | action |
    | xml    | v1/contextEntities/EntityID                                         | GET    |
    | json   | v1/contextEntities/EntityID                                         | GET    |
    | xml    | v1/contextEntities/EntityID/attributes/attributeName                | GET    |
    | json   | v1/contextEntities/EntityID/attributes/attributeName                | GET    |
    | xml    | v1/contextEntities/EntityID/attributes/attributeName/valueID        | GET    |
    | json   | v1/contextEntities/EntityID/attributes/attributeName/valueID        | GET    |
    | xml    | v1/contextEntities/EntityID/attributeDomains/attributeDomainName    | GET    |
    | json   | v1/contextEntities/EntityID/attributeDomains/attributeDomainName    | GET    |
    | xml    | v1/contextEntityTypes/typeName/attributes/attributeName             | GET    |
    | json   | v1/contextEntityTypes/typeName/attributes/attributeName             | GET    |
    | xml    | v1/contextEntityTypes/typeName/attributeDomains/attributeDomainName | GET    |
    | json   | v1/contextEntityTypes/typeName/attributeDomains/attributeDomainName | GET    |
    | xml    | v1/contextEntityTypes/typeName                                      | GET    |
    | json   | v1/contextEntityTypes/typeName                                      | GET    |

  @cb_mdwae
  Scenario Outline: Update Convenience operation
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "<url>"
    When a context broker "<action>" petition is asked to PEP with "<format>" format
    Then the petition gets to the mock
  Examples:
    | format | url                                                          | action |
    | xml    | v1/contextEntities/EntityID                                  | PUT    |
    | json   | v1/contextEntities/EntityID                                  | PUT    |
    | xml    | v1/contextEntities/EntityID/attributes/attributeName         | PUT    |
    | json   | v1/contextEntities/EntityID/attributes/attributeName         | PUT    |
    | xml    | v1/contextEntities/EntityID/attributes/attributeName/valueID | PUT    |
    | json   | v1/contextEntities/EntityID/attributes/attributeName/valueID | PUT    |

  @cb_mdwae
  Scenario Outline: Create Convenience operation
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "<url>"
    When a context broker "<action>" petition is asked to PEP with "<format>" format
    Then the petition gets to the mock
  Examples:
    | format | url                                                  | action |
    | xml    | v1/contextEntities/EntityID                          | POST   |
    | json   | v1/contextEntities/EntityID                          | POST   |
    | xml    | v1/contextEntities/EntityID/attributes/attributeName | POST   |
    | json   | v1/contextEntities/EntityID/attributes/attributeName | POST   |

  @cb_mdwae
  Scenario Outline: Subscribe Convenience operation
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "<url>"
    When a context broker "<action>" petition is asked to PEP with "<format>" format
    Then the petition gets to the mock
  Examples:
    | format | url                                    | action |
    | xml    | v1/contextSubscriptions                | POST   |
    | json   | v1/contextSubscriptions                | POST   |
    | xml    | v1/contextSubscriptions/subscriptionID | PUT    |
    | json   | v1/contextSubscriptions/subscriptionID | PUT    |
    | xml    | v1/contextSubscriptions/subscriptionID | DELETE |
    | json   | v1/contextSubscriptions/subscriptionID | DELETE |

  @cb_mdwae
  Scenario Outline: Discover Convenience operation
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "<url>"
    When a context broker "<action>" petition is asked to PEP with "<format>" format
    Then the petition gets to the mock
  Examples:
    | format | url                                                                          | action |
    | xml    | v1/registry/contextEntities/EntityID                                         | GET    |
    | json   | v1/registry/contextEntities/EntityID                                         | GET    |
    | xml    | v1/registry/contextEntities/EntityID/attributes/attributeName                | GET    |
    | json   | v1/registry/contextEntities/EntityID/attributes/attributeName                | GET    |
    | xml    | v1/registry/contextEntities/EntityID/attributeDomains/attributeDomainName    | GET    |
    | json   | v1/registry/contextEntities/EntityID/attributeDomains/attributeDomainName    | GET    |
    | xml    | v1/registry/contextEntityTypes/typeName/attributes/attributeName             | GET    |
    | json   | v1/registry/contextEntityTypes/typeName/attributes/attributeName             | GET    |
    | xml    | v1/registry/contextEntityTypes/typeName/attributeDomains/attributeDomainName | GET    |
    | json   | v1/registry/contextEntityTypes/typeName/attributeDomains/attributeDomainName | GET    |
    | xml    | v1/registry/contextEntityTypes/typeName                                      | GET    |
    | json   | v1/registry/contextEntityTypes/typeName                                      | GET    |

  @cb_mdwae
  Scenario Outline: Discover Convenience operation
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "<url>"
    When a context broker "<action>" petition is asked to PEP with "<format>" format
    Then the petition gets to the mock
  Examples:
    | format | url                                                                          | action |
    | xml    | v1/registry/contextEntities/EntityID                                         | GET    |
    | json   | v1/registry/contextEntities/EntityID                                         | GET    |
    | xml    | v1/registry/contextEntities/EntityID/attributes/attributeName                | GET    |
    | json   | v1/registry/contextEntities/EntityID/attributes/attributeName                | GET    |
    | xml    | v1/registry/contextEntities/EntityID/attributeDomains/attributeDomainName    | GET    |
    | json   | v1/registry/contextEntities/EntityID/attributeDomains/attributeDomainName    | GET    |
    | xml    | v1/registry/contextEntityTypes/typeName/attributes/attributeName             | GET    |
    | json   | v1/registry/contextEntityTypes/typeName/attributes/attributeName             | GET    |
    | xml    | v1/registry/contextEntityTypes/typeName/attributeDomains/attributeDomainName | GET    |
    | json   | v1/registry/contextEntityTypes/typeName/attributeDomains/attributeDomainName | GET    |
    | xml    | v1/registry/contextEntityTypes/typeName                                      | GET    |
    | json   | v1/registry/contextEntityTypes/typeName                                      | GET    |

  @cb_mdwae
  Scenario Outline: Register Convenience operation
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "<url>"
    When a context broker "<action>" petition is asked to PEP with "<format>" format
    Then the petition gets to the mock
  Examples:
    | format | url                                                                          | action |
    | xml    | v1/registry/contextEntities/EntityID                                         | POST   |
    | json   | v1/registry/contextEntities/EntityID                                         | POST   |
    | xml    | v1/registry/contextEntities/EntityID/attributes/attributeName                | POST   |
    | json   | v1/registry/contextEntities/EntityID/attributes/attributeName                | POST   |
    | xml    | v1/registry/contextEntities/EntityID/attributeDomains/attributeDomainName    | POST   |
    | json   | v1/registry/contextEntities/EntityID/attributeDomains/attributeDomainName    | POST   |
    | xml    | v1/registry/contextEntityTypes/typeName/attributes/attributeName             | POST   |
    | json   | v1/registry/contextEntityTypes/typeName/attributes/attributeName             | POST   |
    | xml    | v1/registry/contextEntityTypes/typeName/attributeDomains/attributeDomainName | POST   |
    | json   | v1/registry/contextEntityTypes/typeName/attributeDomains/attributeDomainName | POST   |
    | xml    | v1/registry/contextEntityTypes/typeName                                      | POST   |
    | json   | v1/registry/contextEntityTypes/typeName                                      | POST   |

  @cb_mdwae
  Scenario Outline: Subscribe-availability Convenience operation
    Given a domain in KEYSTONE
    And a user in the domain
    And a project in the user
    And a url with "<url>"
    When a context broker "<action>" petition is asked to PEP with "<format>" format
    Then the petition gets to the mock
  Examples:
    | format | url                                                         | action |
    | xml    | v1/registry/contextAvailabilitySubscriptions                | POST   |
    | json   | v1/registry/contextAvailabilitySubscriptions                | POST   |
    | xml    | v1/registry/contextAvailabilitySubscriptions/subscriptionId | PUT    |
    | json   | v1/registry/contextAvailabilitySubscriptions/subscriptionId | PUT    |
    | xml    | v1/registry/contextAvailabilitySubscriptions/subscriptionId | DELETE |
    | json   | v1/registry/contextAvailabilitySubscriptions/subscriptionId | DELETE |


    
   


