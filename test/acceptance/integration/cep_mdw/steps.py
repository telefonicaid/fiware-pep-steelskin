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

__author__ = 'Jon Calderin Goñi <jon.caldering@gmail.com>'

import requests
import json

from integration.commons import *
from iotqautils.idm_keystone import IdmUtils


@step('a CEP "([^"]*)" petition is asked to PEP')
def a_cep_petition_is_asked_to_pep(step, action):
    token = IdmUtils.get_token(world.user, world.user, world.domain, world.ks['platform']['address']['ip'], world.ks['platform']['address']['port'])
    headers = {
        "Accept": "application/json",
        'content-type': 'application/json; charset: utf-8',
        'Fiware-Servicepath': world.project,
        'Fiware-Service': world.domain,
        'X-Auth-Token': token
    }
    data = {'test_payload': 'test_value'}
    world.data = json.dumps(data)
    world.headers = headers
    requests.request(action.lower(), 'http://{pep_ip}:{pep_port}'.format(pep_ip=world.pep_host_ip, pep_port=world.pep_port) + world.url, headers=headers, data=json.dumps(data))




