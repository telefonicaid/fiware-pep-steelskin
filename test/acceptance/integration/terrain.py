# -*- coding: utf-8 -*-
"""
Copyright 2014 Telefonica Investigación y Desarrollo, S.A.U

This file is part of fiware-orion-pep

fiware-orion-pep is free software: you can redistribute it and/or
modify it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the License,
or (at your option) any later version.

fiware-orion-pep is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public
License along with fiware-orion-pep.
If not, seehttp://www.gnu.org/licenses/.

For those usages not covered by the GNU Affero General Public License
please contact with::[iot_support@tid.es]
"""
import sys

__author__ = 'Jon'

from iotqautils.idm_keystone import IdmUtils
from lettuce import *
from iotqautils.iotqaLogger import get_logger

from tools.general_utils import *
from properties import *

log = get_logger('terrain')


@before.all
def before_all_scenarios():
    """
    Actions before all scenarios
    Get the initial time at start the tests
    """
    world.test_time_init = time.strftime("%c")
    log.debug('Starting environment')
    # Start proxys and mocks
    start_environment()

    # At first, there are not configuration for PEP
    world.config_set = ''

    log.debug('Initialize environment')
    # initialize_keystone(world.ks['platform'], world.ks['environment_general'])
    # initialize_keystone(world.ks['platform'], world.ks['environment_general_ko'])
    # initialize_keystone(world.ks['platform'], world.ks['environment_general_no_roles'])
    # initialize_keystone(world.ks['platform'], world.ks['environment_domain'])
    # initialize_keystone(world.ks['platform'], world.ks['environment_project'])
    # initialize_keystone(world.ks['platform'], world.ks['environment_bypass'])
    world.structure = IdmUtils.get_structure(world.ks['platform'])

    # General
    # user_roles_general = [(world.ks['user_all'], x['name']) for x in
    #                       world.ks['environment_general']['domains'][0]['users'][0]['projects'][0]['roles']]
    # initialize_ac(user_roles_general,
    #               world.ac['ip'], world.ac['port'],
    #               world.structure,
    #               world.ks['domain_ok'],
    #               world.ks['project_ok'],
    #               'general')
    # # #Domain
    # user_roles_domain = [(x['name'], x['roles'][0]['name']) for x in
    #                      world.ks['environment_domain']['domains'][0]['users']]
    # initialize_ac(user_roles_domain,
    #               world.ac['ip'], world.ac['port'],
    #               world.structure,
    #               world.ks['domain_domain_only'],
    #               world.ks['project_domain_only'],
    #               'domain')
    # # Project
    # user_roles_project = [(x['name'], x['projects'][0]['roles'][0]['name']) for x in
    #                       world.ks['environment_project']['domains'][0]['users']]
    # initialize_ac(user_roles_project,
    #               world.ac['ip'], world.ac['port'],
    #               world.structure,
    #               world.ks['domain_project_only'],
    #               world.ks['project_project_only'],
    #               'project')
    log.debug('Environment ready')

@after.each_scenario
def after_each_scenario(scenario):
    world.data = ''
    world.url = ''
    world.action_type = ''
    world.headers = ''
    world.method = ''
    world.domain = ''
    world.project = ''
    world.user = ''
    world.history = ''
    world.last_petition_added = ''
    world.response = ''
    world.new_petition = ''
    world.format = ''
    sys.stdout.write(("*****Se ha ejecutado el scenario: " + str(scenario.name).encode('utf-8')))



@after.all
def after_all_scenarios(scenario):
    """
    Actions after all scenarios
    Show the initial and final time of the tests completed
    :param scenario:
    """
    # IdmUtils.clean_service(world.ks['platform'], world.ks['domain_ok'])
    # IdmUtils.clean_service(world.ks['platform'], world.ks['domain_ko'])
    # IdmUtils.clean_service(world.ks['platform'], world.ks['domain_no_roles'])
    # IdmUtils.clean_service(world.ks['platform'], world.ks['domain_project_only'])
    # IdmUtils.clean_service(world.ks['platform'], world.ks['domain_domain_only'])
    # IdmUtils.clean_service(world.ks['platform'], world.ks['domain_bypass'])
    # ac_utils = AC(world.ac['ip'], port=world.ac['port'])
    # ac_utils.delete_tenant_policies(world.ks['domain_ok'])
    # ac_utils.delete_tenant_policies(world.ks['domain_project_only'])
    # ac_utils.delete_tenant_policies(world.ks['domain_domain_only'])
    stop_environment()
    show_times(world.test_time_init)
