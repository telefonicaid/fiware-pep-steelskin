# -*- coding: utf-8 -*-
"""
Copyright 2015 Telefonica Investigación y Desarrollo, S.A.U

This file is part of fiware-pep-steelskin

fiware-pep-steelskin is free software: you can redistribute it and/or
modify it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the License,
or (at your option) any later version.

fiware-pep-steelskin is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public
License along with fiware-pep-steelskin.
If not, see http://www.gnu.org/licenses/.

For those usages not covered by the GNU Affero General Public License
please contact with::[iot_support@tid.es]
"""
__author__ = 'Jon Calderin Goñi <jon.caldering@gmail.com>'

from lettuce import world, step
import time
from tools.general_utils import set_config_cb, start_pep_app, set_cb_config_withour_cache, set_cb_config_with_bad_ks_ip, \
    set_cb_config_with_bad_ac_ip, set_cb_config_with_bad_target_ip, set_cb_config_with_bad_pep_user, \
    set_config_cache_gradual, set_config_cache_projects, set_config_cache_roles, set_config_access_control, set_config_perseo, \
    set_config_bypass, stop_process, start_proxy, start_mock, set_cb_config_with_ac_and_headers_deactivated, \
    set_cb_config_with_ac


@step("the Context Broker configuration$")
def the_context_broker_configuration(step):
    """
    Set the context broker plugin (if it is not set) and restart pep
    :type step lettuce.core.Step
    """
    if world.config_set != 'cb':
        world.config_set = 'cb'
        set_config_cb()
        start_pep_app()
        time.sleep(5)


@step("the Context Broker configuration without cache")
def the_context_broker_configuration_without_cache(step):
    """
    Set the context broker plugin (if it is not set) without cache
    :type step lettuce.core.Step
    """
    if world.config_set != 'cb_without_cache':
        world.config_set = 'cb_without_cache'
        set_cb_config_withour_cache()
        start_pep_app()
        time.sleep(5)


@step("restart pep with bad ks configuration")
def restart_pep_with_bad_ks_configuration(step):
    """
    Set the context broker plugin (if it is not set) setting a bad ip of kesytone
    :type step lettuce.core.Step
    """
    if world.config_set != 'bad_ks':
        world.config_set = 'bad_ks'
        set_cb_config_with_bad_ks_ip()
        start_pep_app()
        time.sleep(5)

@step("restart pep with bad ac configuration")
def restart_pep_with_bad_ac_configuration(step):
    """
    Set the context broker plugin (if it is not set) setting a bad ip of access control
    :type step lettuce.core.Step
    """
    if world.config_set != 'bad_ac':
        world.config_set = 'bad_ac'
        set_cb_config_with_bad_ac_ip()
        start_pep_app()
        time.sleep(5)

@step("restart pep with bad target configuration")
def restart_pep_with_bad_target_configuration(step):
    """
    Set the context broker plugin (if it is not set) setting a bad ip of target
    :type step lettuce.core.Step
    """
    if world.config_set != 'bad_target':
        world.config_set = 'bad_target'
        set_cb_config_with_bad_target_ip()
        start_pep_app()
        time.sleep(5)

@step("restart pep with bad pep user")
def restart_pep_with_bad_pep_user(step):
    """
    Set the context broker plugin (if it is not set) setting a bad pep user credential
    :type step lettuce.core.Step
    """
    if world.config_set != 'bad_pep_user':
        world.config_set = 'bad_pep_user'
        set_cb_config_with_bad_pep_user()
        start_pep_app()
        time.sleep(5)


@step("the cache gradual configuration")
def the_cache_gradual_configuration(step):
    """
    Set the context broker plugin setting the cache expired time gradual
    :type step lettuce.core.Step
    """
    world.config_set = 'cache_gradual'
    set_config_cache_gradual()
    start_pep_app()
    time.sleep(5)


@step("the cache projects configuration")
def the_cache_projects_configuration(step):
    """
    Set the context broker plugin setting the cache project expire first
    :type step lettuce.core.Step
    """
    world.config_set = 'cache_projects'
    set_config_cache_projects()
    start_pep_app()
    time.sleep(5)


@step("the cache roles configuration")
def the_cache_roles_configuration(step):
    """
    Ste the context broker plugin setting the cache roles expire first
    :type step lettuce.core.Step
    """
    world.config_set = 'cache_roles'
    set_config_cache_roles()
    start_pep_app()
    time.sleep(5)


@step("the Access Control configuration")
def the_access_control_configuration(step):
    """
    Set the Access Control (keypass) configuration (if it is not set) and restart pep
    :type step lettuce.core.Step
    """
    if world.config_set != 'ac':
        world.config_set = 'ac'
        set_config_access_control()
        start_pep_app()
        time.sleep(5)


@step("the Perseo configuration")
def the_perseo_configuration(step):
    """
    Set the Perseo (CEP) configuration (if it is not set) and restart pep
    :type step lettuce.core.Step
    """
    if world.config_set != 'perseo':
        world.config_set = 'perseo'
        set_config_perseo()
        start_pep_app()
        time.sleep(5)


@step("the Bypass configuration")
def the_bypass_configuration(step):
    """
    Seth the context broker configuration (if its not set) setting the bypass configuration (enabling it)
    :type step lettuce.core.Step
    """
    if world.config_set != 'bypass':
        world.config_set = 'bypass'
        set_config_bypass()
        start_pep_app()
        time.sleep(5)

@step("the Context Broker configuration with Access Control and check headers functionality disabled")
def the_context_broker_configuration_with_Access_control_adn_check_headers_functionality_disabled(step):
    """
    Set the context broker configuration and disable the checks with AC and the checks of the headers
    :param step:
    :return:
    """
    if world.config_set != 'cb_without_ac_and_headers':
        world.config_set = 'cb_without_ac_and_headers'
        set_cb_config_with_ac_and_headers_deactivated()
        start_pep_app()
        time.sleep(5)

@step("the Context Broker configuration with Access Control disabled$")
def the_context_broker_configuration_with_Access_control_adn_check_headers_functionality_disabled(step):
    """
    Set the context broker configuration and disable the checks with AC and the checks of the headers
    :param step:
    :return:
    """
    if world.config_set != 'cb_without_ac':
        world.config_set = 'cb_without_ac'
        set_cb_config_with_ac()
        start_pep_app()
        time.sleep(5)

@step('restart "([^"]*)" process with bad final component port')
def restart_process_with_nad_final_component_port(step, component):
    """
    Restart a proxy or mock given with a bad port configuration for the final target
    :param step:
    :param component:
    :return:
    """
    if component == 'ks':
        stop_process(world.ks_proxy)
        world.ks_proxy = start_proxy(world.ks_proxy_bind_ip, world.ks_proxy_port, world.ks['platform']['address']['ip'],
                                     9876)
        world.ks_faked = True
    elif component == 'ac':
        stop_process(world.ac_proxy)
        world.ac_proxy = start_proxy(world.ac_proxy_bind_ip, world.ac_proxy_port, world.ac['ip'], 9875)
        world.ac_faked = True
    elif component == 'target':
        stop_process(world.mock_dest)
        world.mock_dest = start_mock('mock.py', world.mock['ip'], 9874)
        world.target_faked = True
    else:
        raise ValueError('The process indicated is wrong, the possible values are "ks", "ac" or "target", \
        and the indicated process is: {component}'.format(component=component))
    time.sleep(3)

@step('restart "([^"]*)" process with bad proxy port')
def restar_process_with_bad_proxy_port(step, component):
    """
    Restart a proxy with a bad port
    :param step:
    :param component:
    :return:
    """
    if component == 'ks':
        stop_process(world.ks_proxy)
        world.ks_proxy = start_proxy(world.ks_proxy_bind_ip, 9876, world.ks['platform']['address']['ip'],
                                     world.ks['platform']['address']['port'])
        world.ks_faked = True
    elif component == 'ac':
        stop_process(world.ac_proxy)
        world.ac_proxy = start_proxy('1.1.1.1', 9875, world.ac['ip'], world.ac['port'])
        world.ac_faked = True
    else:
        raise ValueError('The process indicated is wrong, the possible values are "ks" or "ac", \
        and the indicated process is: {component}'.format(component=component))
    time.sleep(3)


@step('restore the process "([^"]*)"')
def restore_the_process(step, component):
    """
    Restart a proxy or mock given with the correct configuration
    :param step:
    :param component:
    :return:
    """
    if component == 'ks':
        stop_process(world.ks_proxy)
        world.ks_proxy = start_proxy(world.ks_proxy_bind_ip, world.ks_proxy_port, world.ks['platform']['address']['ip'],
                                     world.ks['platform']['address']['port'])
        world.ks_faked = False
    elif component == 'ac':
        stop_process(world.ac_proxy)
        world.ac_proxy = start_proxy(world.ac_proxy_bind_ip, world.ac_proxy_port, world.ac['ip'], world.ac['port'])
        world.ac_faked = False
    elif component == 'target':
        stop_process(world.mock_dest)
        world.mock_dest = start_mock('mock.py', world.mock['ip'], world.mock['port'])
        world.target_faked = False
    else:
        raise ValueError('The process indicated is wrong, the possible values are "ks", "ac" or "target", \
        and the indicated process is: {component}'.format(component=component))
    time.sleep(3)