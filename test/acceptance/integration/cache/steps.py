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
import json
from iotqautils.idm_keystone import IdmUtils
import requests
import time

__author__ = 'Jon'

from lettuce import step, world

@step('the PEP returns an ok')
def the_pep_returns_an_ok(step):
    assert world.response.status_code == 200

@step('the history is saved$')
def the_history_is(step):
    resp = requests.request('GET', 'http://{ks_proxy_ip}:{ks_proxy_port}/history'.format(ks_proxy_ip=world.ks_proxy_ip, ks_proxy_port=world.ks_proxy_port)).text
    world.history = resp

@step('the history is the same as saved')
def the_history_is(step):
    resp = requests.request('GET', 'http://{ks_proxy_ip}:{ks_proxy_port}/history'.format(ks_proxy_ip=world.ks_proxy_ip, ks_proxy_port=world.ks_proxy_port)).text
    assert world.history == resp

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
    assert len(history_list)+int(petitions_added) == len(history_new_list)

@step('the value added to the history is ok')
def the_value_added_to_the_history_is(step):
    assert world.new_petition == world.last_petition_added

@step('waits "([^"]*)" seconds to "([^"]*)" cache expire')
def waits_group1_seconds_to_group2_cache_expire(step, time_to_sleep, cache_group):
    time.sleep(int(time_to_sleep) + 1)
    if cache_group == 'users':
        world.new_petition = 'v3/auth/tokens'
    if cache_group == 'projects':
        world.new_petition = 'v3/projects'
    if cache_group == 'roles':
        world.new_petition = 'v3/role_assignments'