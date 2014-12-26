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

import subprocess, os

from tools.general_utils import *

from iotqautils.idm_keystone import IdmUtils
from iotqautils.accessControl import AC
from iotqautils.pep_utils import Pep

from lettuce import *

from integration.properties import *




@before.all
def before_all_scenarios():
    """
    Actions before all scenarios
    Get the initial time at start the tests
    """
    world.test_time_init = time.strftime("%c")
    world.mock = start_mock_destinations()
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
    try:
        IdmUtils.prepare_environment(world.ks['platform'], world.ks['environment_general'])
        # IdmUtils.prepare_environment(world.ks['platform'], world.ks['environment_domain'])
        # IdmUtils.prepare_environment(world.ks['platform'], world.ks['environment_project'])
    except:
        IdmUtils.clean_service(world.ks['platform'], 'atlantic')
        # IdmUtils.clean_service(world.ks['platform'], world.ks['domain_project_only'])
        # IdmUtils.clean_service(world.ks['platform'], world.ks['domain_domain_only'])
        IdmUtils.prepare_environment(world.ks['platform'], world.ks['environment_general'])
        # IdmUtils.prepare_environment(world.ks['platform'], world.ks['environment_domain'])
        # IdmUtils.prepare_environment(world.ks['platform'], world.ks['environment_project'])

    world.ac_utils = AC('127.0.0.1')
    world.pep = Pep('0.0.0.0', '1026')
    #Clean AC
    world.ac_utils.delete_tenant_policies(world.ks['domain_ok'])
    # world.ac_utils.delete_tenant_policies(world.ks['domain_project_only'])
    # world.ac_utils.delete_tenant_policies(world.ks['domain_domain_only'])
    structure = IdmUtils.get_structure(world.ks['platform'])
    #General
    #Create rol
    customer_role_id = structure[world.ks['domain_ok']]['projects'][world.ks['project_ok']]['users'][world.ks['user_all']]['roles'][world.ac['create_rol']]['id']
    world.ac_utils.create_policy(world.ks['domain_ok'], customer_role_id, 'create_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_ok'], world.ks['project_ok']), world.ac['create_rol'])
    #Update Rol
    customer_role_id = structure[world.ks['domain_ok']]['projects'][world.ks['project_ok']]['users'][world.ks['user_all']]['roles'][world.ac['update_rol']]['id']
    world.ac_utils.create_policy(world.ks['domain_ok'], customer_role_id, 'update_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_ok'], world.ks['project_ok']), world.ac['update_rol'])
    #delete Rol
    customer_role_id = structure[world.ks['domain_ok']]['projects'][world.ks['project_ok']]['users'][world.ks['user_all']]['roles'][world.ac['delete_rol']]['id']
    world.ac_utils.create_policy(world.ks['domain_ok'], customer_role_id, 'delete_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_ok'], world.ks['project_ok']), world.ac['delete_rol'])
    #Read Rol
    customer_role_id = structure[world.ks['domain_ok']]['projects'][world.ks['project_ok']]['users'][world.ks['user_all']]['roles'][world.ac['read_rol']]['id']
    world.ac_utils.create_policy(world.ks['domain_ok'], customer_role_id, 'read_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_ok'], world.ks['project_ok']), world.ac['read_rol'])
    #Subscribe Rol
    customer_role_id = structure[world.ks['domain_ok']]['projects'][world.ks['project_ok']]['users'][world.ks['user_all']]['roles'][world.ac['subscribe_rol']]['id']
    world.ac_utils.create_policy(world.ks['domain_ok'], customer_role_id, 'subscribe_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_ok'], world.ks['project_ok']), world.ac['subscribe_rol'])
    #Register Rol
    customer_role_id = structure[world.ks['domain_ok']]['projects'][world.ks['project_ok']]['users'][world.ks['user_all']]['roles'][world.ac['register_rol']]['id']
    world.ac_utils.create_policy(world.ks['domain_ok'], customer_role_id, 'register_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_ok'], world.ks['project_ok']), world.ac['register_rol'])
    #Discover Rol
    customer_role_id = structure[world.ks['domain_ok']]['projects'][world.ks['project_ok']]['users'][world.ks['user_all']]['roles'][world.ac['discover_rol']]['id']
    world.ac_utils.create_policy(world.ks['domain_ok'], customer_role_id, 'discover_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_ok'], world.ks['project_ok']), world.ac['discover_rol'])
    #subscribe-availability Rol
    customer_role_id = structure[world.ks['domain_ok']]['projects'][world.ks['project_ok']]['users'][world.ks['user_all']]['roles'][world.ac['subscribe-availability_rol']]['id']
    world.ac_utils.create_policy(world.ks['domain_ok'], customer_role_id, 'subscribe-availability_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_ok'], world.ks['project_ok']), world.ac['subscribe-availability_rol'])
    #notify Rol
    customer_role_id = structure[world.ks['domain_ok']]['projects'][world.ks['project_ok']]['users'][world.ks['user_all']]['roles'][world.ac['notify_rol']]['id']
    world.ac_utils.create_policy(world.ks['domain_ok'], customer_role_id, 'notify_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_ok'], world.ks['project_ok']), world.ac['notify_rol'])
    #readRule Rol
    customer_role_id = structure[world.ks['domain_ok']]['projects'][world.ks['project_ok']]['users'][world.ks['user_all']]['roles'][world.ac['readRule_rol']]['id']
    world.ac_utils.create_policy(world.ks['domain_ok'], customer_role_id, 'readRule_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_ok'], world.ks['project_ok']), world.ac['readRule_rol'])
    #writeRule Rol
    customer_role_id = structure[world.ks['domain_ok']]['projects'][world.ks['project_ok']]['users'][world.ks['user_all']]['roles'][world.ac['writeRule_rol']]['id']
    world.ac_utils.create_policy(world.ks['domain_ok'], customer_role_id, 'writeRule_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_ok'], world.ks['project_ok']), world.ac['writeRule_rol'])
    #readPolicy Rol
    customer_role_id = structure[world.ks['domain_ok']]['projects'][world.ks['project_ok']]['users'][world.ks['user_all']]['roles'][world.ac['readPolicy_rol']]['id']
    world.ac_utils.create_policy(world.ks['domain_ok'], customer_role_id, 'readPolicy_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_ok'], world.ks['project_ok']), world.ac['readPolicy_rol'])
    #removePolicy Rol
    customer_role_id = structure[world.ks['domain_ok']]['projects'][world.ks['project_ok']]['users'][world.ks['user_all']]['roles'][world.ac['removePolicy_rol']]['id']
    world.ac_utils.create_policy(world.ks['domain_ok'], customer_role_id, 'removePolicy_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_ok'], world.ks['project_ok']), world.ac['removePolicy_rol'])
    #createPolicy Rol
    customer_role_id = structure[world.ks['domain_ok']]['projects'][world.ks['project_ok']]['users'][world.ks['user_all']]['roles'][world.ac['createPolicy_rol']]['id']
    world.ac_utils.create_policy(world.ks['domain_ok'], customer_role_id, 'createPolicy_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_ok'], world.ks['project_ok']), world.ac['createPolicy_rol'])
    #listPolicies Rol
    customer_role_id = structure[world.ks['domain_ok']]['projects'][world.ks['project_ok']]['users'][world.ks['user_all']]['roles'][world.ac['listPolicies_rol']]['id']
    world.ac_utils.create_policy(world.ks['domain_ok'], customer_role_id, 'listPolicies_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_ok'], world.ks['project_ok']), world.ac['listPolicies_rol'])
    #deleteSubjectPolicies Rol
    customer_role_id = structure[world.ks['domain_ok']]['projects'][world.ks['project_ok']]['users'][world.ks['user_all']]['roles'][world.ac['deleteSubjectPolicies_rol']]['id']
    world.ac_utils.create_policy(world.ks['domain_ok'], customer_role_id, 'deleteSubjectPolicies_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_ok'], world.ks['project_ok']), world.ac['deleteSubjectPolicies_rol'])
    #deleteTenantPolicies Rol
    customer_role_id = structure[world.ks['domain_ok']]['projects'][world.ks['project_ok']]['users'][world.ks['user_all']]['roles'][world.ac['deleteTenantPolicies_rol']]['id']
    world.ac_utils.create_policy(world.ks['domain_ok'], customer_role_id, 'deleteTenantPolicies_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_ok'], world.ks['project_ok']), world.ac['deleteTenantPolicies_rol'])

    # #Project only
    # #Create rol
    # customer_role_id = structure[world.ks['domain_project_only']]['projects'][world.ks['project_project_only']]['users'][world.ks['user_create_project']]['roles'][world.ac['create_rol']]['id']
    # world.ac_utils.create_policy(world.ks['domain_project_only'], customer_role_id, 'create_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_project_only'], world.ks['project_project_only']), 'create')
    # #Update rol
    # customer_role_id = structure[world.ks['domain_project_only']]['projects'][world.ks['project_project_only']]['users'][world.ks['user_update_project']]['roles'][world.ac['update_rol']]['id']
    # world.ac_utils.create_policy(world.ks['domain_project_only'], customer_role_id, 'update_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_project_only'], world.ks['project_project_only']), world.ac['update_rol'])
    # #Delete rol
    # customer_role_id = structure[world.ks['domain_project_only']]['projects'][world.ks['project_project_only']]['users'][world.ks['user_delete_project']]['roles'][world.ac['delete_rol']]['id']
    # world.ac_utils.create_policy(world.ks['domain_project_only'], customer_role_id, 'delete_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_project_only'], world.ks['project_project_only']), world.ac['delete_rol'])
    # #read rol
    # customer_role_id = structure[world.ks['domain_project_only']]['projects'][world.ks['project_project_only']]['users'][world.ks['user_read_project']]['roles'][world.ac['read_rol']]['id']
    # world.ac_utils.create_policy(world.ks['domain_project_only'], customer_role_id, 'read_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_project_only'], world.ks['project_project_only']), world.ac['read_rol'])
    # #subscribe rol
    # customer_role_id = structure[world.ks['domain_project_only']]['projects'][world.ks['project_project_only']]['users'][world.ks['user_subscribe_project']]['roles'][world.ac['subscribe_rol']]['id']
    # world.ac_utils.create_policy(world.ks['domain_project_only'], customer_role_id, 'subscribe_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_project_only'], world.ks['project_project_only']), world.ac['subscribe_rol'])
    # #register rol
    # customer_role_id = structure[world.ks['domain_project_only']]['projects'][world.ks['project_project_only']]['users'][world.ks['user_register_project']]['roles'][world.ac['register_rol']]['id']
    # world.ac_utils.create_policy(world.ks['domain_project_only'], customer_role_id, 'register_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_project_only'], world.ks['project_project_only']), world.ac['register_rol'])
    # #discover rol
    # customer_role_id = structure[world.ks['domain_project_only']]['projects'][world.ks['project_project_only']]['users'][world.ks['user_discover_project']]['roles'][world.ac['discover_rol']]['id']
    # world.ac_utils.create_policy(world.ks['domain_project_only'], customer_role_id, 'discover_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_project_only'], world.ks['project_project_only']), world.ac['discover_rol'])
    # #subscribe-availability rol
    # customer_role_id = structure[world.ks['domain_project_only']]['projects'][world.ks['project_project_only']]['users'][world.ks['user_subscribe-availability_project']]['roles'][world.ac['subscribe-availability_rol']]['id']
    # world.ac_utils.create_policy(world.ks['domain_project_only'], customer_role_id, 'subscribe-availability_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_project_only'], world.ks['project_project_only']), world.ac['subscribe-availability_rol'])
    # #notify rol
    # customer_role_id = structure[world.ks['domain_project_only']]['projects'][world.ks['project_project_only']]['users'][world.ks['user_notify_project']]['roles'][world.ac['notify_rol']]['id']
    # world.ac_utils.create_policy(world.ks['domain_project_only'], customer_role_id, 'notify_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_project_only'], world.ks['project_project_only']), world.ac['notify_rol'])
    # #readRule rol
    # customer_role_id = structure[world.ks['domain_project_only']]['projects'][world.ks['project_project_only']]['users'][world.ks['user_readRule_project']]['roles'][world.ac['readRule_rol']]['id']
    # world.ac_utils.create_policy(world.ks['domain_project_only'], customer_role_id, 'readRule_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_project_only'], world.ks['project_project_only']), world.ac['readRule_rol'])
    # #writeRule rol
    # customer_role_id = structure[world.ks['domain_project_only']]['projects'][world.ks['project_project_only']]['users'][world.ks['user_writeRule_project']]['roles'][world.ac['writeRule_rol']]['id']
    # world.ac_utils.create_policy(world.ks['domain_project_only'], customer_role_id, 'writeRule_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_project_only'], world.ks['project_project_only']), world.ac['writeRule_rol'])
    # #readPolicy rol
    # customer_role_id = structure[world.ks['domain_project_only']]['projects'][world.ks['project_project_only']]['users'][world.ks['user_readPolicy_project']]['roles'][world.ac['readPolicy_rol']]['id']
    # world.ac_utils.create_policy(world.ks['domain_project_only'], customer_role_id, 'readPolicy_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_project_only'], world.ks['project_project_only']), world.ac['readPolicy_rol'])
    # #removePolicy rol
    # customer_role_id = structure[world.ks['domain_project_only']]['projects'][world.ks['project_project_only']]['users'][world.ks['user_removePolicy_project']]['roles'][world.ac['removePolicy_rol']]['id']
    # world.ac_utils.create_policy(world.ks['domain_project_only'], customer_role_id, 'removePolicy_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_project_only'], world.ks['project_project_only']), world.ac['removePolicy_rol'])
    # #createPolicy rol
    # customer_role_id = structure[world.ks['domain_project_only']]['projects'][world.ks['project_project_only']]['users'][world.ks['user_createPolicy_project']]['roles'][world.ac['createPolicy_rol']]['id']
    # world.ac_utils.create_policy(world.ks['domain_project_only'], customer_role_id, 'createPolicy_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_project_only'], world.ks['project_project_only']), world.ac['createPolicy_rol'])
    # #listPolicies rol
    # customer_role_id = structure[world.ks['domain_project_only']]['projects'][world.ks['project_project_only']]['users'][world.ks['user_listPolicies_project']]['roles'][world.ac['listPolicies_rol']]['id']
    # world.ac_utils.create_policy(world.ks['domain_project_only'], customer_role_id, 'listPolicies_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_project_only'], world.ks['project_project_only']), world.ac['listPolicies_rol'])
    # #deleteSubjectPolicies rol
    # customer_role_id = structure[world.ks['domain_project_only']]['projects'][world.ks['project_project_only']]['users'][world.ks['user_deleteSubjectPolicies_project']]['roles'][world.ac['deleteSubjectPolicies_rol']]['id']
    # world.ac_utils.create_policy(world.ks['domain_project_only'], customer_role_id, 'deleteSubjectPolicies_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_project_only'], world.ks['project_project_only']), world.ac['deleteSubjectPolicies_rol'])
    # #deleteTenantPolicies rol
    # customer_role_id = structure[world.ks['domain_project_only']]['projects'][world.ks['project_project_only']]['users'][world.ks['user_deleteTenantPolicies_project']]['roles'][world.ac['deleteTenantPolicies_rol']]['id']
    # world.ac_utils.create_policy(world.ks['domain_project_only'], customer_role_id, 'deleteTenantPolicies_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_project_only'], world.ks['project_project_only']), world.ac['deleteTenantPolicies_rol'])
    #
    # #Domain only
    # #Create rol
    # customer_role_id = structure[world.ks['domain_domain_only']]['users'][world.ks['user_create_domain']]['roles'][world.ac['create_rol']]['id']
    # world.ac_utils.create_policy(world.ks['domain_domain_only'], customer_role_id, 'create_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_domain_only'], world.ks['project_domain_only']), 'create')
    # #Update rol
    # customer_role_id = structure[world.ks['domain_domain_only']]['users'][world.ks['user_update_domain']]['roles'][world.ac['update_rol']]['id']
    # world.ac_utils.create_policy(world.ks['domain_domain_only'], customer_role_id, 'update_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_domain_only'], world.ks['project_domain_only']), world.ac['update_rol'])
    # #Delete rol
    # customer_role_id = structure[world.ks['domain_domain_only']]['users'][world.ks['user_delete_domain']]['roles'][world.ac['delete_rol']]['id']
    # world.ac_utils.create_policy(world.ks['domain_domain_only'], customer_role_id, 'delete_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_domain_only'], world.ks['project_domain_only']), world.ac['delete_rol'])
    # #read rol
    # customer_role_id = structure[world.ks['domain_domain_only']]['users'][world.ks['user_read_domain']]['roles'][world.ac['read_rol']]['id']
    # world.ac_utils.create_policy(world.ks['domain_domain_only'], customer_role_id, 'read_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_domain_only'], world.ks['project_domain_only']), world.ac['read_rol'])
    # #subscribe rol
    # customer_role_id = structure[world.ks['domain_domain_only']]['users'][world.ks['user_subscribe_domain']]['roles'][world.ac['subscribe_rol']]['id']
    # world.ac_utils.create_policy(world.ks['domain_domain_only'], customer_role_id, 'subscribe_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_domain_only'], world.ks['project_domain_only']), world.ac['subscribe_rol'])
    # #register rol
    # customer_role_id = structure[world.ks['domain_domain_only']]['users'][world.ks['user_register_domain']]['roles'][world.ac['register_rol']]['id']
    # world.ac_utils.create_policy(world.ks['domain_domain_only'], customer_role_id, 'register_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_domain_only'], world.ks['project_domain_only']), world.ac['register_rol'])
    # #discover rol
    # customer_role_id = structure[world.ks['domain_domain_only']]['users'][world.ks['user_discover_domain']]['roles'][world.ac['discover_rol']]['id']
    # world.ac_utils.create_policy(world.ks['domain_domain_only'], customer_role_id, 'discover_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_domain_only'], world.ks['project_domain_only']), world.ac['discover_rol'])
    # #subscribe-availability rol
    # customer_role_id = structure[world.ks['domain_domain_only']]['users'][world.ks['user_subscribe-availability_domain']]['roles'][world.ac['subscribe-availability_rol']]['id']
    # world.ac_utils.create_policy(world.ks['domain_domain_only'], customer_role_id, 'subscribe-availability_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_domain_only'], world.ks['project_domain_only']), world.ac['subscribe-availability_rol'])
    # #notify rol
    # customer_role_id = structure[world.ks['domain_domain_only']]['users'][world.ks['user_notify_domain']]['roles'][world.ac['notify_rol']]['id']
    # world.ac_utils.create_policy(world.ks['domain_domain_only'], customer_role_id, 'notify_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_domain_only'], world.ks['project_domain_only']), world.ac['notify_rol'])
    # #readRule rol
    # customer_role_id = structure[world.ks['domain_domain_only']]['users'][world.ks['user_readRule_domain']]['roles'][world.ac['readRule_rol']]['id']
    # world.ac_utils.create_policy(world.ks['domain_domain_only'], customer_role_id, 'readRule_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_domain_only'], world.ks['project_domain_only']), world.ac['readRule_rol'])
    # #writeRule rol
    # customer_role_id = structure[world.ks['domain_domain_only']]['users'][world.ks['user_writeRule_domain']]['roles'][world.ac['writeRule_rol']]['id']
    # world.ac_utils.create_policy(world.ks['domain_domain_only'], customer_role_id, 'writeRule_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_domain_only'], world.ks['project_domain_only']), world.ac['writeRule_rol'])
    # #readPolicy rol
    # customer_role_id = structure[world.ks['domain_domain_only']]['users'][world.ks['user_readPolicy_domain']]['roles'][world.ac['readPolicy_rol']]['id']
    # world.ac_utils.create_policy(world.ks['domain_domain_only'], customer_role_id, 'readPolicy_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_domain_only'], world.ks['project_domain_only']), world.ac['readPolicy_rol'])
    # #removePolicy rol
    # customer_role_id = structure[world.ks['domain_domain_only']]['users'][world.ks['user_removePolicy_domain']]['roles'][world.ac['removePolicy_rol']]['id']
    # world.ac_utils.create_policy(world.ks['domain_domain_only'], customer_role_id, 'removePolicy_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_domain_only'], world.ks['project_domain_only']), world.ac['removePolicy_rol'])
    # #createPolicy rol
    # customer_role_id = structure[world.ks['domain_domain_only']]['users'][world.ks['user_createPolicy_domain']]['roles'][world.ac['createPolicy_rol']]['id']
    # world.ac_utils.create_policy(world.ks['domain_domain_only'], customer_role_id, 'createPolicy_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_domain_only'], world.ks['project_domain_only']), world.ac['createPolicy_rol'])
    # #listPolicies rol
    # customer_role_id = structure[world.ks['domain_domain_only']]['users'][world.ks['user_listPolicies_domain']]['roles'][world.ac['listPolicies_rol']]['id']
    # world.ac_utils.create_policy(world.ks['domain_domain_only'], customer_role_id, 'listPolicies_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_domain_only'], world.ks['project_domain_only']), world.ac['listPolicies_rol'])
    # #deleteSubjectPolicies rol
    # customer_role_id = structure[world.ks['domain_domain_only']]['users'][world.ks['user_deleteSubjectPolicies_domain']]['roles'][world.ac['deleteSubjectPolicies_rol']]['id']
    # world.ac_utils.create_policy(world.ks['domain_domain_only'], customer_role_id, 'deleteSubjectPolicies_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_domain_only'], world.ks['project_domain_only']), world.ac['deleteSubjectPolicies_rol'])
    # #deleteTenantPolicies rol
    # customer_role_id = structure[world.ks['domain_domain_only']]['users'][world.ks['user_deleteTenantPolicies_domain']]['roles'][world.ac['deleteTenantPolicies_rol']]['id']
    # world.ac_utils.create_policy(world.ks['domain_domain_only'], customer_role_id, 'deleteTenantPolicies_policy', 'fiware:orion:%s:%s::' % (world.ks['domain_domain_only'], world.ks['project_domain_only']), world.ac['deleteTenantPolicies_rol'])
    #

@before.outline
def sleep(scenario, *args):
    #time.sleep(2)
    pass


@after.all
def after_all_scenarios(scenario):
    """
    Actions after all scenarios
    Show the initial and final time of the tests completed
    :param scenario:
    """
    stop_mock(world.mock.pid)
    IdmUtils.clean_service(world.ks['platform'], world.ks['domain_ok'])
    # IdmUtils.clean_service(world.ks['platform'], world.ks['domain_project_only'])
    # IdmUtils.clean_service(world.ks['platform'], world.ks['domain_domain_only'])
    # world.ac_utils.delete_tenant_policies(world.ks['domain_ok'])
    # world.ac_utils.delete_tenant_policies(world.ks['domain_project_only'])
    # world.ac_utils.delete_tenant_policies(world.ks['domain_domain_only'])
    showTimes(world.test_time_init)

