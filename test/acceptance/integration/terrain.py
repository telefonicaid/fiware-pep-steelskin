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
If not, see http://www.gnu.org/licenses/.

For those usages not covered by the GNU Affero General Public License
please contact with::[iot_support@tid.es]
"""
from iotqautils.accessControl import AC
import sys

__author__ = 'Jon Calderin Goñi <jon.caldering@gmail.com>'
import time
from lettuce import world, before, after
from iotqautils.idm_keystone import IdmUtils
from iotqautils.iotqaLogger import get_logger
from tools.general_utils import start_environment, initialize_keystone, initialize_ac, stop_process, start_proxy, \
    stop_environment, show_times, start_mock, reset_test_variables

log = get_logger('terrain', file=True, filename='logs/lettuce.log')



@before.all
def before_all_scenarios():
    """
    Actions before all scenarios
    Get the initial time at start the tests
    """
    world.log = log
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
    reset_test_variables()
    log.debug('Environment ready')

@after.each_scenario
def after_each_scenario(scenario):
    reset_test_variables()
    """ If the mocks/proxys are changed, restore ir after each test """
    if hasattr(world, 'ks_faked') and world.ks_faked:
        stop_process(world.ks_proxy)
        world.ks_proxy = start_proxy(world.ks_proxy_bind_ip, world.ks_proxy_port, world.ks['platform']['address']['ip'],
                                     world.ks['platform']['address']['port'])
        world.ks_faked = False
    if hasattr(world, 'ac_faked') and world.ac_faked:
        stop_process(world.ac_proxy)
        world.ac_proxy = start_proxy(world.ac_proxy_bind_ip, world.ac_proxy_port, world.ac['ip'], world.ac['port'])
        world.ac_faked = False
    if hasattr(world, 'target_faked') and world.target_faked:
        stop_process(world.mock_dest)
        world.mock_dest = start_mock('mock.py', world.mock['ip'], world.mock['port'])
        world.target_faked = False
    sys.stdout.write(("*****Se ha ejecutado el scenario: " + str(scenario.name).encode('utf-8')))

@after.outline
def reset_data(scenario, *args):
    reset_test_variables()


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
