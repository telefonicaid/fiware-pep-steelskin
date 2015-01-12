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
from iotqautils.idm_keystone import IdmUtils

__author__ = 'Jon'

from lettuce import step, world
import requests


@step('headers of bad rol environment with project')
def headers_of_bad_rol_environment_with_project(step):
    token = IdmUtils.get_token(world.ks['user_all_ko'], world.ks['user_all_ko'], world.ks['domain_ko'], world.ks['platform']['address']['ip'])
    headers = {
        "Accept": "application/json",
        'content-type': 'application/json',
        'Fiware-Servicepath': world.ks['project_ko'],
        'Fiware-Service': world.ks['domain_ko'],
        'X-Auth-Token': token
    }
    world.headers = headers

@step('headers of bad rol environment without project')
def headers_of_bad_rol_environment_without_project(step):
    token = IdmUtils.get_token(world.ks['user_all_ko'], world.ks['user_all_ko'], world.ks['domain_ko'], world.ks['platform']['address']['ip'])
    headers = {
        "Accept": "application/json",
        'content-type': 'application/json',
        'Fiware-Servicepath': '/',
        'Fiware-Service': world.ks['domain_ko'],
        'X-Auth-Token': token
    }
    world.headers = headers

@step('the access control proxy receive the last petition "([^"]*)" from PEP')
def the_keystone_proxy_doesnt_receive_any_petition(step, last_petition):
    resp = requests.request('GET', 'http://{ac_proxy_ip}:{ac_proxy_port}/last_path'.format(ac_proxy_ip=world.ac_proxy_ip, ac_proxy_port=world.ac_proxy_port)).text
    assert resp == last_petition