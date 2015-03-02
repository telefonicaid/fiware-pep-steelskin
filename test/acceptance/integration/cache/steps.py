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
import json
from iotqautils.idm_keystone import IdmUtils
import requests
import time

__author__ = 'Jon Calderin Goñi <jon.caldering@gmail.com>'

from lettuce import step, world

@step('the PEP returns an ok')
def the_pep_returns_an_ok(step):
    """
    Check if PEP returns ok http code (200)
    :param step:
    :return:
    """
    assert world.response.status_code == 200, 'The PEP not return the ok response code'

@step('the history is saved$')
def the_history_is_saved(step):
    """
    Get the keystone history from the proxy
    :param step:
    :return:
    """
    resp = requests.request('GET', 'http://{ks_proxy_ip}:{ks_proxy_port}/history'.format(ks_proxy_ip=world.ks_proxy_ip, ks_proxy_port=world.ks_proxy_port)).text
    world.history = resp

@step('the history is the same as saved')
def the_history_is_the_same_as_saved(step):
    """
    Check the history saved has not changed
    :param step:
    :return:
    """
    resp = requests.request('GET', 'http://{ks_proxy_ip}:{ks_proxy_port}/history'.format(ks_proxy_ip=world.ks_proxy_ip, ks_proxy_port=world.ks_proxy_port)).text
    assert world.history == resp, 'The history changed, it has to be equal'

@step('headers general')
def headers_general(step):
    """
    A general headers with a universal configuration (User with all roles configured in the project specified)
    :param step:
    :return:
    """
    token = IdmUtils.get_token(world.ks['user_all'], world.ks['user_all'], world.ks['domain_ok'], world.ks['platform']['address']['ip'], world.ks['platform']['address']['port'])
    headers = {
        "Accept": "application/json",
        'content-type': 'application/json',
        'Fiware-Servicepath': world.ks['project_ok'],
        'Fiware-Service': world.ks['domain_ok'],
        'X-Auth-Token': token
    }
    world.headers = headers

@step('the history of petitions adds "([^"]*)" petition')
def the_history_off_petitions_adds_a_petition(step, petitions_added):
    """
    Check if the history has more petitions than before, when it was saved
    :param step:
    :param petitions_added:
    :return:
    """
    resp = requests.request('GET', 'http://{ks_proxy_ip}:{ks_proxy_port}/history'.format(ks_proxy_ip=world.ks_proxy_ip, ks_proxy_port=world.ks_proxy_port)).text
    history_list = eval(world.history)
    history_new_list = eval(resp)
    world.last_petition_added = history_new_list[len(history_new_list)-1]
    assert len(history_list)+int(petitions_added) == len(history_new_list), 'The petitions added to the history are not the expected'

@step('the value added to the history is ok')
def the_value_added_to_the_history_is_ok(step):
    """
    Check if the last petition is the same as the new petition saved
    :param step:
    :return:
    """
    assert world.new_petition == world.last_petition_added, 'The petition asked is not the expected'

@step('waits "([^"]*)" seconds to "([^"]*)" cache expire')
def waits_group1_seconds_to_group2_cache_expire(step, time_to_sleep, cache_group):
    """
    Store the new petition will be raised depending of which cache is expired (empty by default)
    :param step:
    :param time_to_sleep:
    :param cache_group:
    :return:
    """
    time.sleep(int(time_to_sleep) + 1)
    if cache_group == 'users':
        world.new_petition = 'v3/auth/tokens'
    if cache_group == 'projects':
        world.new_petition = 'v3/projects'
    if cache_group == 'roles':
        world.new_petition = 'v3/role_assignments'