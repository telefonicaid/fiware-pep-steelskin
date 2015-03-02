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

__author__ = 'Jon Calderin Goñi <jon.caldering@gmail.com>'

from lettuce import step, world
import requests
from iotqautils.idm_keystone import IdmUtils


@step('headers of bad role environment with project')
def headers_of_bad_role_environment_with_project(step):
    """
    Headers configured with an user with bad roles (roles existent in keystone but not in Access Control)
    :param step:
    :return:
    """
    token = IdmUtils.get_token(world.ks['user_all_ko'], world.ks['user_all_ko'], world.ks['domain_ko'], world.ks['platform']['address']['ip'], world.ks['platform']['address']['port'])
    headers = {
        "Accept": "application/json",
        'content-type': 'application/json',
        'Fiware-Servicepath': world.ks['project_ko'],
        'Fiware-Service': world.ks['domain_ko'],
        'X-Auth-Token': token
    }
    world.headers = headers

@step('headers of bad role environment without project')
def headers_of_bad_role_environment_without_project(step):
    """
    Headers configured without project and with an user with bad roles (roles existent in keystone but not in Access Control)
    :param step:
    :return:
    """
    token = IdmUtils.get_token(world.ks['user_all_ko'], world.ks['user_all_ko'], world.ks['domain_ko'], world.ks['platform']['address']['ip'], world.ks['platform']['address']['port'])
    headers = {
        "Accept": "application/json",
        'content-type': 'application/json',
        'Fiware-Servicepath': '/',
        'Fiware-Service': world.ks['domain_ko'],
        'X-Auth-Token': token
    }
    world.headers = headers

@step('the access control proxy receive the last petition "([^"]*)" from PEP')
def the_access_control_proxy_receive_the_last_petition(step, last_petition):
    """
    Check the access control proxy and assert if the las petition given is the las petition asked by pep to access control
    :param step:
    :param last_petition:
    :return:
    """
    resp = requests.request('GET', 'http://{ac_proxy_ip}:{ac_proxy_port}/last_path'.format(ac_proxy_ip=world.ac_proxy_ip, ac_proxy_port=world.ac_proxy_port)).text
    assert resp == last_petition, 'The last petition done to ac is not the defined in the test'