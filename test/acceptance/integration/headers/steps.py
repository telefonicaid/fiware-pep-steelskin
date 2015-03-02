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

from iotqautils.idm_keystone import IdmUtils, RequestUtils
from iotqautils.pep_utils import Pep

import requests
import json

@step('headers without the header "([^"]*)"')
def headers_without_the_header(step, header):
    """
    Delete the header given
    :param step:
    :param header:
    :return:
    """
    del world.headers[header]

@step('header "([^"]*)" inexistent in KEYSTONE')
def headers_inexistent_in_keystone(step, header):
    """
    Set the value "inexistant" to the header given
    :param step:
    :param header:
    :return:
    """
    world.headers[header] = 'inexistant'


@step('headers with format "([^"]*)" and "([^"]*)" action')
def headers_with_format_and_action(step, format, action):
    """
    Set headers with the universal domain, user and project, with given format and action
    :param step:
    :param format:
    :param action:
    :return:
    """
    token = IdmUtils.get_token(world.ks['user_all'], world.ks['user_all'], world.ks['domain_ok'], world.ks['platform']['address']['ip'], world.ks['platform']['address']['port'])
    world.format = format
    headers = {
        "Accept": "application/%s" % world.format,
        'content-type': 'application/%s' % world.format,
        'Fiware-Servicepath': world.ks['project_ok'],
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


@step('the content-type header with the value "([^"]*)"')
def the_content_type_header_with_the_value_group1(step, content_type):
    """
    Set the content-type header
    :param step:
    :param content_type:
    :return:
    """
    world.headers['content-type'] = content_type

@step('the payload with the value "([^"]*)"')
def the_payload_with_the_value_group1(step, payload):
    """
    Set the payload given.
    :param step:
    :param payload:
    :return:
    """
    try:
        world.data = json.dumps(json.loads(payload.replace('\'', '"')))
    except:
        world.data = payload