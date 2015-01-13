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

__author__ = 'Jon'
from lettuce import step, world

from iotqautils.idm_keystone import IdmUtils, RequestUtils
from iotqautils.pep_utils import Pep

import requests
import json

@step('headers without the header "([^"]*)"')
def headers_without_the_header_group1(step, header):
    del world.headers[header]

@step('header "([^"]*)" inexistent in KEYSTONE')
def headers_without_the_header_group1(step, header):
    world.headers[header] = 'inexistant'


@step('headers with format "([^"]*)" and "([^"]*)" action')
def with_format_group1(step, format, action):
    token = IdmUtils.get_token(world.ks['user_all'], world.ks['user_all'], world.ks['domain_ok'], world.ks['platform']['address']['ip'])
    world.format = format
    headers = {
        "Accept": "application/%s" % world.format,
        'content-type': 'application/%s' % world.format,
        'Fiware-Servicepath': '/',
        'Fiware-Service': world.ks['domain_ok'],
        'X-Auth-Token': token
    }
    world.headers = headers
    if format == 'json':
        data = {'updateAction': action}
        world.data = json.dumps(data)
    else:
        data = "<updateAction>%s</updateAction>" % action
        world.data = data


@step('the petition action "([^"]*)" is asked$')
def the_petition_is_asked(step, action):
    world.response = requests.request(action.lower(), 'http://{pep_ip}:{pep_port}/'.format(pep_ip=world.pep_host_ip, pep_port=world.pep_port) + world.url, headers=world.headers, data=world.data)



