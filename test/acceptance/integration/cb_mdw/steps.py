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
    print token
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








