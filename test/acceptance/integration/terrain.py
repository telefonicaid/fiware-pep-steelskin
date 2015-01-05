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
from iotqautils.iotqaLogger import get_logger

log = get_logger('terrain')


@before.all
def before_all_scenarios():
    """
    Actions before all scenarios
    Get the initial time at start the tests
    """
    world.test_time_init = time.strftime("%c")
    #world.mock = start_mock_destinations(world.mock['ip'], world.mock['port'])
    log.debug('Starting environment')
    start_environment()
    world.config_set = ''
    #set_config_cb()
    #set_config_keypass()
    #start_docker_pep(world.docker_ip, world.docker_user, world.docker_password, 'root', 'root', 'pep_c4')

    log.debug('Initialize environment')
    # initialize_keystone(world.ks['platform'], world.ks['environment_general'])
    # initialize_keystone(world.ks['platform'], world.ks['environment_domain'])
    # initialize_keystone(world.ks['platform'], world.ks['environment_project'])
    initialize_keystone(world.ks['platform'], world.ks['environment_bypass'])

    world.structure = IdmUtils.get_structure(world.ks['platform'])
    # General
    # user_roles_general = [(world.ks['user_all'], x['name']) for x in
    #                       world.ks['environment_general']['domains'][0]['users'][0]['projects'][0]['roles']]
    # initialize_ac(user_roles_general,
    #               world.ac['ip'],
    #               world.structure,
    #               world.ks['domain_ok'],
    #               world.ks['project_ok'],
    #               'general')
    # user_roles_domain = [(x['name'], x['roles'][0]['name']) for x in
    #                      world.ks['environment_domain']['domains'][0]['users']]
    # initialize_ac(user_roles_domain,
    #               world.ac['ip'],
    #               world.structure,
    #               world.ks['domain_domain_only'],
    #               world.ks['project_domain_only'],
    #               'domain')
    # user_roles_project = [(x['name'], x['projects'][0]['roles'][0]['name']) for x in
    #                       world.ks['environment_project']['domains'][0]['users']]
    # initialize_ac(user_roles_project,
    #               world.ac['ip'],
    #               world.structure,
    #               world.ks['domain_project_only'],
    #               world.ks['project_project_only'],
    #               'project')
    # log.debug('Environment ready')


@after.all
def after_all_scenarios(scenario):
    """
    Actions after all scenarios
    Show the initial and final time of the tests completed
    :param scenario:
    """
    # stop_mock(world.mock.pid)
    # IdmUtils.clean_service(world.ks['platform'], world.ks['domain_ok'])
    # IdmUtils.clean_service(world.ks['platform'], world.ks['domain_project_only'])
    # IdmUtils.clean_service(world.ks['platform'], world.ks['domain_domain_only'])
    # world.ac_utils.delete_tenant_policies(world.ks['domain_ok'])
    # world.ac_utils.delete_tenant_policies(world.ks['domain_project_only'])
    # world.ac_utils.delete_tenant_policies(world.ks['domain_domain_only'])
    stop_environment()
    showTimes(world.test_time_init)
