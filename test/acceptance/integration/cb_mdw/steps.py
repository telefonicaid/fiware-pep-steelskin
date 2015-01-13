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

__author__ = 'jon'

import requests
import json

from iotqautils.idm_keystone import IdmUtils
from tools.general_utils import convert

from integration.commons import *

@step('url with "([^"]*)" and the actionType attribute "([^"]*)"')
def a_url_with_group1_and_the_actiontype_attribute_group2(step, url, action_type):
    world.url = url
    world.action_type = action_type


@step('a context broker "([^"]*)" petition is asked to PEP with "([^"]*)" format')
def a_context_broker_petition_is_asked_to_pep_with_format(step, action, format):
    token = IdmUtils.get_token(world.user, world.user, world.domain, world.ks['platform']['address']['ip'])
    headers = {
        "Accept": "application/%s" % format,
        'content-type': 'application/%s' % format,
        'Fiware-Servicepath': world.project,
        'Fiware-Service': world.domain,
        'X-Auth-Token': token
    }
    world.headers = headers
    if hasattr(world, 'action_type'):
        if format == 'json':
            data = {
                'updateAction': world.action_type
            }
            world.data = json.dumps(data)
            requests.request(action.lower(), 'http://{pep_ip}:{pep_port}/'.format(pep_ip=world.pep_host_ip, pep_port=world.pep_port) + world.url, headers=headers, data=json.dumps(data))
        else:
            data = "<updateAction>%s</updateAction>" % world.action_type
            world.data = data
            requests.request(action.lower(), 'http://{pep_ip}:{pep_port}/'.format(pep_ip=world.pep_host_ip, pep_port=world.pep_port) + world.url, headers=headers, data=data)
    else:
        world.data = {}
        requests.request(action.lower(), 'http://{pep_ip}:{pep_port}/'.format(pep_ip=world.pep_host_ip, pep_port=world.pep_port) + world.url, headers=headers, data={})








