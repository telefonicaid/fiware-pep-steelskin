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
from iotqautils.pep_utils import Pep


world.ac = {}
world.ks = {}

# bypass
world.ks['bypass_user'] = 'bypass_admin'
world.ks['bypass_domain'] = 'bypass_domain'
world.ac['bypass_rol'] = 'bypass'
world.ks['bypass_project'] = '/bypass_project'

# General
world.ks['user_all'] = 'octopus'
world.ks['domain_ok'] = 'atlantic'
world.ks['project_ok'] = '/coral'

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

# Ace rules
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
