# Created by Jon at 15/12/2014
Feature: Context broker actions when the rol is defined only in a project
  Check if all urls of CB are mapped to the correct action. This action are defined in the project of the user in Keystone

  Background:
    Given the Context Broker configuration

  #Standard operations
  @cb_actions_project_rol
  Scenario Outline: Create Standard operation
    Given a domain for project_only in KEYSTONE
    And a without role in domain and with "user_create_project" user in project
    And a "create_rol" role in the user project
    And url with "v1/updateContext" and the actionType attribute "APPEND"
    When a context broker "POST" petition is asked to PEP with "<format>" format
    Then the petition gets to the mock
  Examples:
    | format |
    | xml    |
    | json   |

  @cb_actions_project_rol
  Scenario Outline: Update Standard operation
    Given a domain for project_only in KEYSTONE
    And a without role in domain and with "user_update_project" user in project
    And a "update_rol" role in the user project
    And url with "v1/updateContext" and the actionType attribute "UPDATE"
    When a context broker "POST" petition is asked to PEP with "<format>" format
    Then the petition gets to the mock
  Examples:
    | format |
    | xml    |
    | json   |

  @cb_actions_project_rol
  Scenario Outline: Delete Standard operation
    Given a domain for project_only in KEYSTONE
    And a without role in domain and with "user_delete_project" user in project
    And a "delete_rol" role in the user project
    And url with "v1/updateContext" and the actionType attribute "DELETE"
    When a context broker "POST" petition is asked to PEP with "<format>" format
    Then the petition gets to the mock
  Examples:
    | format |
    | xml    |
    | json   |

  @cb_actions_project_rol
  Scenario Outline: Read Standard operation
    Given a domain for project_only in KEYSTONE
    And a without role in domain and with "user_read_project" user in project
    And a "read_rol" role in the user project
    And a url with "<url>"
    When a context broker "POST" petition is asked to PEP with "<format>" format
    Then the petition gets to the mock
  Examples:
    | format | url             |
    | xml    | v1/queryContext |
    | json   | v1/queryContext |
    | xml    | v1/contextTypes |
    | json   | v1/contextTypes |

  @cb_actions_project_rol
  Scenario Outline: Subscribe Standard operation
    Given a domain for project_only in KEYSTONE
    And a without role in domain and with "user_subscribe_project" user in project
    And a "subscribe_rol" role in the user project
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

  @cb_actions_project_rol
  Scenario Outline: Register Standard operation
    Given a domain for project_only in KEYSTONE
    And a without role in domain and with "user_register_project" user in project
    And a "register_rol" role in the user project
    And a url with "v1/registry/registerContext"
    When a context broker "POST" petition is asked to PEP with "<format>" format
    Then the petition gets to the mock
  Examples:
    | format |
    | xml    |
    | json   |

  @cb_actions_project_rol
  Scenario Outline: Discover Standard operation
    Given a domain for project_only in KEYSTONE
    And a without role in domain and with "user_discover_project" user in project
    And a "discover_rol" role in the user project
    And a url with "v1/registry/discoverContextAvailability"
    When a context broker "POST" petition is asked to PEP with "<format>" format
    Then the petition gets to the mock
  Examples:
    | format |
    | xml    |
    | json   |

  @cb_actions_project_rol
  Scenario Outline: subscribe-availability Standard operation
    Given a domain for project_only in KEYSTONE
    And a without role in domain and with "user_subscribe-availability_project" user in project
    And a "subscribe-availability_rol" role in the user project
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
  @cb_actions_project_rol
  Scenario Outline: Read Convenience operation
    Given a domain for project_only in KEYSTONE
    And a without role in domain and with "user_read_project" user in project
    And a "read_rol" role in the user project
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

  @cb_actions_project_rol
  Scenario Outline: Update Convenience operation
    Given a domain for project_only in KEYSTONE
    And a without role in domain and with "user_update_project" user in project
    And a "update_rol" role in the user project
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

  @cb_actions_project_rol
  Scenario Outline: Create Convenience operation
    Given a domain for project_only in KEYSTONE
    And a without role in domain and with "user_create_project" user in project
    And a "create_rol" role in the user project
    And a url with "<url>"
    When a context broker "<action>" petition is asked to PEP with "<format>" format
    Then the petition gets to the mock
  Examples:
    | format | url                                                  | action |
    | xml    | v1/contextEntities/EntityID                          | POST   |
    | json   | v1/contextEntities/EntityID                          | POST   |
    | xml    | v1/contextEntities/EntityID/attributes/attributeName | POST   |
    | json   | v1/contextEntities/EntityID/attributes/attributeName | POST   |

  @cb_actions_project_rol
  Scenario Outline: Subscribe Convenience operation
    Given a domain for project_only in KEYSTONE
    And a without role in domain and with "user_subscribe_project" user in project
    And a "subscribe_rol" role in the user project
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

  @cb_actions_project_rol
  Scenario Outline: Discover Convenience operation
    Given a domain for project_only in KEYSTONE
    And a without role in domain and with "user_discover_project" user in project
    And a "discover_rol" role in the user project
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

  @cb_actions_project_rol
  Scenario Outline: Register Convenience operation
    Given a domain for project_only in KEYSTONE
    And a without role in domain and with "user_register_project" user in project
    And a "register_rol" role in the user project
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

  @cb_actions_project_rol
  Scenario Outline: Subscribe-availability Convenience operation
    Given a domain for project_only in KEYSTONE
    And a without role in domain and with "user_subscribe-availability_project" user in project
    And a "subscribe-availability_rol" role in the user project
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






