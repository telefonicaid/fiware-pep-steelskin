# -*- coding: utf-8 -*-
"""
(c) Copyright 2014 Telefonica, I+D. Printed in Spain (Europe). All Rights
Reserved.

The copyright to the software program(s) is property of Telefonica I+D.
The program(s) may be used and or copied only with the express written
consent of Telefonica I+D or in accordance with the terms and conditions
stipulated in the agreement/contract under which the program(s) have
been supplied.
"""
__author__ = 'Jon'

from lettuce import world
import socket

# world.environment = 'local'
# world.environment = 'remote'
world.environment = 'docker'

world.docker_ip = '192.168.1.38'
world.docker_user = 'vagrant'
world.docker_password = 'vagrant'


world.keypass_extract_action = 'extractAction'
world.cb_extract_action = 'extractCBAction'
world.perseo_extract_action = 'extractAction'
world.keypass_plug_in = 'keypassPlugin'
world.cb_plug_in = 'orionPlugin'
world.perseo_plug_in = 'perseoPlugin'

world.ks_proxy_bind_ip = '0.0.0.0'
world.ks_proxy_ip = '192.168.56.1'
world.ks_proxy_port = '5001'

world.ac_proxy_bind_ip = '0.0.0.0'
world.ac_proxy_ip = '192.168.56.1'
world.ac_proxy_port = '8082'

world.pep_log_level = 'DEBUG'

world.pep_user = 'pep'
world.pep_password = 'pep'
world.pep_domain = 'admin_domain'
world.pep_ip = '127.0.0.1'
world.pep_port = '1025'

world.mock = {
    'ip': '192.168.56.1',
    'port': '1027'
}

world.ac = {}

# AC rules
world.ac['ip'] = '127.0.0.1'
world.ac['port'] = '8080'
world.ac['bypass_rol'] = 'bypass'
world.ac['create_rol'] = 'create'
world.ac['update_rol'] = 'update'
world.ac['delete_rol'] = 'delete'
world.ac['read_rol'] = 'read'
world.ac['subscribe_rol'] = 'subscribe'
world.ac['register_rol'] = 'register'
world.ac['discover_rol'] = 'discover'
world.ac['subscribe-availability_rol'] = 'subscribe-availability'
world.ac['notify_rol'] = 'notify'
world.ac['readRule_rol'] = 'readRule'
world.ac['writeRule_rol'] = 'writeRule'
world.ac['readPolicy_rol'] = 'readPolicy'
world.ac['removePolicy_rol'] = 'deletePolicy'
world.ac['createPolicy_rol'] = 'createPolicy'
world.ac['listPolicies_rol'] = 'listPolicies'
world.ac['deleteSubjectPolicies_rol'] = 'deleteSubjectPolicies'
world.ac['deleteTenantPolicies_rol'] = 'deleteTenantPolicies'

world.ks = {}
world.ks['platform'] = {
    'GlobalServiceAdmin': {
        'user': 'admin',
        'password': 'admin',
        'roles': ['admin', '_member_'],
        'domain': 'Default',
        'project': 'admin'
    },
    'RegionalServiceAdmin': {
        'user': 'cloud_admin',
        'password': 'password'
    },
    'address': {
        'ip': '127.0.0.1',
        'port': '5000'
    },
    'pep': {
        'user': 'pep',
        'password': 'pep',
        'mail': 'pep@no.com',
        'roles': ['service', '_member_']
    },
    'cloud_domain': {
        'name': 'admin_domain'
    },
    'admin_rol': {
        'name': 'admin'
    }
}

# bypass
world.ks['bypass_user'] = 'bypass_admin'
world.ks['bypass_domain'] = 'bypass_domain'
world.ks['bypass_project'] = '/bypass_project'

# General
world.ks['user_all'] = 'octopus'
world.ks['domain_ok'] = 'atlantic'
world.ks['project_ok'] = '/coral'
world.ks['environment_general'] = {
    'domains': [
        {
            'name': 'atlantic',
            'description': 'All the atlantic Ocean',
            'domain_admin': {
                'username': 'white_shark',
                'password': 'white_shark'
            },
            'users': [
                {
                    'name': world.ks['user_all'],
                    'password': world.ks['user_all'],
                    'description': 'Tentacles guy',
                    'roles': [
                        {
                            'name': 'SubServiceAdmin'
                        }
                    ],
                    'projects': [
                        {
                            'name': '/coral',
                            'description': 'Nemos house',
                            'roles': [
                                {
                                    'name': world.ac['create_rol']
                                },
                                {
                                    'name': world.ac['update_rol']
                                },
                                {
                                    'name': world.ac['delete_rol']
                                },
                                {
                                    'name': world.ac['read_rol']
                                },
                                {
                                    'name': world.ac['subscribe_rol']
                                },
                                {
                                    'name': world.ac['register_rol']
                                },
                                {
                                    'name': world.ac['discover_rol']
                                },
                                {
                                    'name': world.ac['subscribe-availability_rol']
                                },
                                {
                                    'name': world.ac['notify_rol']
                                },
                                {
                                    'name': world.ac['readRule_rol']
                                },
                                {
                                    'name': world.ac['writeRule_rol']
                                },
                                {
                                    'name': world.ac['readPolicy_rol']
                                },
                                {
                                    'name': world.ac['removePolicy_rol']
                                },
                                {
                                    'name': world.ac['createPolicy_rol']
                                },
                                {
                                    'name': world.ac['listPolicies_rol']
                                },
                                {
                                    'name': world.ac['deleteSubjectPolicies_rol']
                                },
                                {
                                    'name': world.ac['deleteTenantPolicies_rol']
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
}

# Project Only
world.ks['user_create_project'] = 'krim_create'
world.ks['user_update_project'] = 'krim_update'
world.ks['user_delete_project'] = 'krim_delete'
world.ks['user_read_project'] = 'krim_read'
world.ks['user_subscribe_project'] = 'krim_subscribe'
world.ks['user_register_project'] = 'krim_register'
world.ks['user_discover_project'] = 'krim_discover'
world.ks['user_subscribe-availability_project'] = 'krim_subscribe-availability'
world.ks['user_notify_project'] = 'krim_notify'
world.ks['user_readRule_project'] = 'krim_readRule'
world.ks['user_writeRule_project'] = 'krim_writeRule'
world.ks['user_readPolicy_project'] = 'krim_readPolicy'
world.ks['user_removePolicy_project'] = 'krim_removePolicy'
world.ks['user_createPolicy_project'] = 'krim_createPolicy'
world.ks['user_listPolicies_project'] = 'krim_listPolicies'
world.ks['user_deleteSubjectPolicies_project'] = 'krim_deleteSubjectPolicies'
world.ks['user_deleteTenantPolicies_project'] = 'krim_deleteTenantPolicies'
world.ks['domain_project_only'] = 'atlantic_only_project'
world.ks['project_project_only'] = '/cave'
world.ks['environment_project'] = {
    'domains': [
        {
            'name': world.ks['domain_project_only'],
            'description': 'All the atlantic Ocean',
            'domain_admin': {
                'username': 'white_shark',
                'password': 'white_shark'
            },
            'users': [
                {
                    'name': world.ks['user_create_project'],
                    'password': world.ks['user_create_project'],
                    'description': 'Little animal',
                    'projects': [
                        {
                            'name': world.ks['project_project_only'],
                            'description': 'Cave in the ocean',
                            'roles': [
                                {
                                    'name': world.ac['create_rol']
                                },
                            ]
                        }
                    ]
                },
                {
                    'name': world.ks['user_update_project'],
                    'password': world.ks['user_update_project'],
                    'description': 'Little animal',
                    'projects': [
                        {
                            'name': world.ks['project_project_only'],
                            'description': 'Cave in the ocean',
                            'roles': [
                                {
                                    'name': world.ac['update_rol']
                                },
                            ]
                        }
                    ]
                },
                {
                    'name': world.ks['user_delete_project'],
                    'password': world.ks['user_delete_project'],
                    'description': 'Little animal',
                    'projects': [
                        {
                            'name': world.ks['project_project_only'],
                            'description': 'Cave in the ocean',
                            'roles': [
                                {
                                    'name': world.ac['delete_rol']
                                },
                            ]
                        }
                    ]
                },
                {
                    'name': world.ks['user_read_project'],
                    'password': world.ks['user_read_project'],
                    'description': 'Little animal',
                    'projects': [
                        {
                            'name': world.ks['project_project_only'],
                            'description': 'Cave in the ocean',
                            'roles': [
                                {
                                    'name': world.ac['read_rol']
                                },
                            ]
                        }
                    ]
                },
                {
                    'name': world.ks['user_subscribe_project'],
                    'password': world.ks['user_subscribe_project'],
                    'description': 'Little animal',
                    'projects': [
                        {
                            'name': world.ks['project_project_only'],
                            'description': 'Cave in the ocean',
                            'roles': [
                                {
                                    'name': world.ac['subscribe_rol']
                                },
                            ]
                        }
                    ]
                },
                {
                    'name': world.ks['user_register_project'],
                    'password': world.ks['user_register_project'],
                    'description': 'Little animal',
                    'projects': [
                        {
                            'name': world.ks['project_project_only'],
                            'description': 'Cave in the ocean',
                            'roles': [
                                {
                                    'name': world.ac['register_rol']
                                },
                            ]
                        }
                    ]
                },
                {
                    'name': world.ks['user_discover_project'],
                    'password': world.ks['user_discover_project'],
                    'description': 'Little animal',
                    'projects': [
                        {
                            'name': world.ks['project_project_only'],
                            'description': 'Cave in the ocean',
                            'roles': [
                                {
                                    'name': world.ac['discover_rol']
                                },
                            ]
                        }
                    ]
                },
                {
                    'name': world.ks['user_subscribe-availability_project'],
                    'password': world.ks['user_subscribe-availability_project'],
                    'description': 'Little animal',
                    'projects': [
                        {
                            'name': world.ks['project_project_only'],
                            'description': 'Cave in the ocean',
                            'roles': [
                                {
                                    'name': world.ac['subscribe-availability_rol']
                                },
                            ]
                        }
                    ]
                },
                {
                    'name': world.ks['user_notify_project'],
                    'password': world.ks['user_notify_project'],
                    'description': 'Little animal',
                    'projects': [
                        {
                            'name': world.ks['project_project_only'],
                            'description': 'Cave in the ocean',
                            'roles': [
                                {
                                    'name': world.ac['notify_rol']
                                },
                            ]
                        }
                    ]
                },
                {
                    'name': world.ks['user_readRule_project'],
                    'password': world.ks['user_readRule_project'],
                    'description': 'Little animal',
                    'projects': [
                        {
                            'name': world.ks['project_project_only'],
                            'description': 'Cave in the ocean',
                            'roles': [
                                {
                                    'name': world.ac['readRule_rol']
                                },
                            ]
                        }
                    ]
                },
                {
                    'name': world.ks['user_writeRule_project'],
                    'password': world.ks['user_writeRule_project'],
                    'description': 'Little animal',
                    'projects': [
                        {
                            'name': world.ks['project_project_only'],
                            'description': 'Cave in the ocean',
                            'roles': [
                                {
                                    'name': world.ac['writeRule_rol']
                                },
                            ]
                        }
                    ]
                },
                {
                    'name': world.ks['user_readPolicy_project'],
                    'password': world.ks['user_readPolicy_project'],
                    'description': 'Little animal',
                    'projects': [
                        {
                            'name': world.ks['project_project_only'],
                            'description': 'Cave in the ocean',
                            'roles': [
                                {
                                    'name': world.ac['readPolicy_rol']
                                },
                            ]
                        }
                    ]
                },
                {
                    'name': world.ks['user_removePolicy_project'],
                    'password': world.ks['user_removePolicy_project'],
                    'description': 'Little animal',
                    'projects': [
                        {
                            'name': world.ks['project_project_only'],
                            'description': 'Cave in the ocean',
                            'roles': [
                                {
                                    'name': world.ac['removePolicy_rol']
                                },
                            ]
                        }
                    ]
                },
                {
                    'name': world.ks['user_createPolicy_project'],
                    'password': world.ks['user_createPolicy_project'],
                    'description': 'Little animal',
                    'projects': [
                        {
                            'name': world.ks['project_project_only'],
                            'description': 'Cave in the ocean',
                            'roles': [
                                {
                                    'name': world.ac['createPolicy_rol']
                                },
                            ]
                        }
                    ]
                },
                {
                    'name': world.ks['user_listPolicies_project'],
                    'password': world.ks['user_listPolicies_project'],
                    'description': 'Little animal',
                    'projects': [
                        {
                            'name': world.ks['project_project_only'],
                            'description': 'Cave in the ocean',
                            'roles': [
                                {
                                    'name': world.ac['listPolicies_rol']
                                },
                            ]
                        }
                    ]
                },
                {
                    'name': world.ks['user_deleteSubjectPolicies_project'],
                    'password': world.ks['user_deleteSubjectPolicies_project'],
                    'description': 'Little animal',
                    'projects': [
                        {
                            'name': world.ks['project_project_only'],
                            'description': 'Cave in the ocean',
                            'roles': [
                                {
                                    'name': world.ac['deleteSubjectPolicies_rol']
                                },
                            ]
                        }
                    ]
                },
                {
                    'name': world.ks['user_deleteTenantPolicies_project'],
                    'password': world.ks['user_deleteTenantPolicies_project'],
                    'description': 'Little animal',
                    'projects': [
                        {
                            'name': world.ks['project_project_only'],
                            'description': 'Cave in the ocean',
                            'roles': [
                                {
                                    'name': world.ac['deleteTenantPolicies_rol']
                                },
                            ]
                        }
                    ]
                }

            ]
        },
    ]
}


# Domain Only
world.ks['user_create_domain'] = 'crab_create'
world.ks['user_update_domain'] = 'crab_update'
world.ks['user_delete_domain'] = 'crab_delete'
world.ks['user_read_domain'] = 'crab_read'
world.ks['user_subscribe_domain'] = 'crab_subscribe'
world.ks['user_register_domain'] = 'crab_register'
world.ks['user_discover_domain'] = 'crab_discover'
world.ks['user_subscribe-availability_domain'] = 'crab_subscribe-availability'
world.ks['user_notify_domain'] = 'crab_notify'
world.ks['user_readRule_domain'] = 'crab_readRule'
world.ks['user_writeRule_domain'] = 'crab_writeRule'
world.ks['user_readPolicy_domain'] = 'crab_readPolicy'
world.ks['user_removePolicy_domain'] = 'crab_removePolicy'
world.ks['user_createPolicy_domain'] = 'crab_createPolicy'
world.ks['user_listPolicies_domain'] = 'crab_listPolicies'
world.ks['user_deleteSubjectPolicies_domain'] = 'crab_deleteSubjectPolicies'
world.ks['user_deleteTenantPolicies_domain'] = 'crab_deleteTenantPolicies'
world.ks['domain_domain_only'] = 'atlantic_only_domain'
world.ks['project_domain_only'] = '/'
world.ks['environment_domain'] = {
    'domains': [
        {
            'name': world.ks['domain_domain_only'],
            'description': 'All the atlantic Ocean',
            'domain_admin': {
                'username': 'white_shark',
                'password': 'white_shark'
            },
            'users': [
                {
                    'name': world.ks['user_create_domain'],
                    'password': world.ks['user_create_domain'],
                    'description': 'Claws guy',
                    'roles': [
                        {
                            'name': world.ac['create_rol']
                        }
                    ]
                },
                {
                    'name': world.ks['user_update_domain'],
                    'password': world.ks['user_update_domain'],
                    'description': 'Claws guy',
                    'roles': [
                        {
                            'name': world.ac['update_rol']
                        }
                    ]
                },
                {
                    'name': world.ks['user_delete_domain'],
                    'password': world.ks['user_delete_domain'],
                    'description': 'Claws guy',
                    'roles': [
                        {
                            'name': world.ac['delete_rol']
                        }
                    ]
                },
                {
                    'name': world.ks['user_read_domain'],
                    'password': world.ks['user_read_domain'],
                    'description': 'Claws guy',
                    'roles': [
                        {
                            'name': world.ac['read_rol']
                        }
                    ]
                },
                {
                    'name': world.ks['user_subscribe_domain'],
                    'password': world.ks['user_subscribe_domain'],
                    'description': 'Claws guy',
                    'roles': [
                        {
                            'name': world.ac['subscribe_rol']
                        }
                    ]
                },
                {
                    'name': world.ks['user_register_domain'],
                    'password': world.ks['user_register_domain'],
                    'description': 'Claws guy',
                    'roles': [
                        {
                            'name': world.ac['register_rol']
                        }
                    ]
                },
                {
                    'name': world.ks['user_discover_domain'],
                    'password': world.ks['user_discover_domain'],
                    'description': 'Claws guy',
                    'roles': [
                        {
                            'name': world.ac['discover_rol']
                        }
                    ]
                },
                {
                    'name': world.ks['user_subscribe-availability_domain'],
                    'password': world.ks['user_subscribe-availability_domain'],
                    'description': 'Claws guy',
                    'roles': [
                        {
                            'name': world.ac['subscribe-availability_rol']
                        }
                    ]
                },
                {
                    'name': world.ks['user_notify_domain'],
                    'password': world.ks['user_notify_domain'],
                    'description': 'Claws guy',
                    'roles': [
                        {
                            'name': world.ac['notify_rol']
                        }
                    ]
                },
                {
                    'name': world.ks['user_readRule_domain'],
                    'password': world.ks['user_readRule_domain'],
                    'description': 'Claws guy',
                    'roles': [
                        {
                            'name': world.ac['readRule_rol']
                        }
                    ]
                },
                {
                    'name': world.ks['user_writeRule_domain'],
                    'password': world.ks['user_writeRule_domain'],
                    'description': 'Claws guy',
                    'roles': [
                        {
                            'name': world.ac['writeRule_rol']
                        }
                    ]
                },
                {
                    'name': world.ks['user_readPolicy_domain'],
                    'password': world.ks['user_readPolicy_domain'],
                    'description': 'Claws guy',
                    'roles': [
                        {
                            'name': world.ac['readPolicy_rol']
                        }
                    ]
                },
                {
                    'name': world.ks['user_removePolicy_domain'],
                    'password': world.ks['user_removePolicy_domain'],
                    'description': 'Claws guy',
                    'roles': [
                        {
                            'name': world.ac['removePolicy_rol']
                        }
                    ]
                },
                {
                    'name': world.ks['user_createPolicy_domain'],
                    'password': world.ks['user_createPolicy_domain'],
                    'description': 'Claws guy',
                    'roles': [
                        {
                            'name': world.ac['createPolicy_rol']
                        }
                    ]
                },
                {
                    'name': world.ks['user_listPolicies_domain'],
                    'password': world.ks['user_listPolicies_domain'],
                    'description': 'Claws guy',
                    'roles': [
                        {
                            'name': world.ac['listPolicies_rol']
                        }
                    ]
                },
                {
                    'name': world.ks['user_deleteSubjectPolicies_domain'],
                    'password': world.ks['user_deleteSubjectPolicies_domain'],
                    'description': 'Claws guy',
                    'roles': [
                        {
                            'name': world.ac['deleteSubjectPolicies_rol']
                        }
                    ]
                },
                {
                    'name': world.ks['user_deleteTenantPolicies_domain'],
                    'password': world.ks['user_deleteTenantPolicies_domain'],
                    'description': 'Claws guy',
                    'roles': [
                        {
                            'name': world.ac['deleteTenantPolicies_rol']
                        }
                    ]
                }
            ]
        }
    ]
}

world.ks['domain_bypass'] = 'bypass_domain'
world.ks['user_bypass'] = 'bypass_user'
world.ks['project_bypass'] = 'bypass_project'

world.ks['environment_bypass'] = {
    'domains': [
        {
            'name': world.ks['domain_bypass'],
            'description': 'All the atlantic Ocean',
            'domain_admin': {
                'username': 'white_shark',
                'password': 'white_shark'
            },
            'users': [
                {
                    'name': world.ks['user_bypass'],
                    'password': world.ks['user_bypass'],
                    'description': 'Little animal',
                    'roles': [
                        {
                            'name': world.ac['bypass_rol']
                        }
                    ],
                    'projects': [
                        {
                            'name': world.ks['project_bypass'],
                            'description': 'Cave in the ocean',
                            'roles': [
                                {
                                    'name': world.ac['bypass_rol']
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
}
