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
import json
from iotqautils.idm_keystone import IdmUtils
import requests
import time

__author__ = 'Jon'

from lettuce import step, world

@step('the PEP returns an ok')
def the_pep_returns_an_ok(step):
    assert world.response.status_code == 200, 'The PEP not return the ok response code'

@step('the history is saved$')
def the_history_is(step):
    resp = requests.request('GET', 'http://{ks_proxy_ip}:{ks_proxy_port}/history'.format(ks_proxy_ip=world.ks_proxy_ip, ks_proxy_port=world.ks_proxy_port)).text
    world.history = resp

@step('the history is the same as saved')
def the_history_is(step):
    resp = requests.request('GET', 'http://{ks_proxy_ip}:{ks_proxy_port}/history'.format(ks_proxy_ip=world.ks_proxy_ip, ks_proxy_port=world.ks_proxy_port)).text
    assert world.history == resp, 'The history changed, it has to be equial'

@step('headers general')
def headers_general(step):
    token = IdmUtils.get_token(world.ks['user_all'], world.ks['user_all'], world.ks['domain_ok'], world.ks['platform']['address']['ip'])
    headers = {
        "Accept": "application/json",
        'content-type': 'application/json',
        'Fiware-Servicepath': world.ks['project_ok'],
        'Fiware-Service': world.ks['domain_ok'],
        'X-Auth-Token': token
    }
    world.headers = headers

@step('the history of petitions adds "([^"]*)" token petition')
def the_history_off_petitions_adds_a_token_petition(step, petitions_added):
    resp = requests.request('GET', 'http://{ks_proxy_ip}:{ks_proxy_port}/history'.format(ks_proxy_ip=world.ks_proxy_ip, ks_proxy_port=world.ks_proxy_port)).text
    history_list = eval(world.history)
    history_new_list = eval(resp)
    world.last_petition_added = history_new_list[len(history_new_list)-1]
    assert len(history_list)+int(petitions_added) == len(history_new_list), 'The petitions added to the history are not the expected'

@step('the value added to the history is ok')
def the_value_added_to_the_history_is(step):
    assert world.new_petition == world.last_petition_added, 'The petition asked is not the expected'

@step('waits "([^"]*)" seconds to "([^"]*)" cache expire')
def waits_group1_seconds_to_group2_cache_expire(step, time_to_sleep, cache_group):
    time.sleep(int(time_to_sleep) + 1)
    if cache_group == 'users':
        world.new_petition = 'v3/auth/tokens'
    if cache_group == 'projects':
        world.new_petition = 'v3/projects'
    if cache_group == 'roles':
        world.new_petition = 'v3/role_assignments'