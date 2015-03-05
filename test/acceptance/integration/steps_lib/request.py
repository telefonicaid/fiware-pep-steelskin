# -*- coding: utf-8 -*-
"""
Copyright 2015 Telefonica Investigación y Desarrollo, S.A.U

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

__author__ = 'Jon Calderin Goñi <jon.caldering@gmail.com>'

from lettuce import step, world
import requests
from requests.exceptions import ConnectionError

@step('the petition action "([^"]*)" is asked without data')
def the_petition_action_is_asked_without_data(step, action):
    """
    Ask a request to pep without data (with the url and headers set before)
    :param step:
    :param action:
    :return:
    """
    world.response = requests.request(action.lower(), 'http://{pep_ip}:{pep_port}'.format(pep_ip=world.pep_host_ip,
                                                                                          pep_port=world.pep_port) + world.url,
                                      headers=world.headers, data=json.dumps({}))


@step('the petition action "([^"]*)" is asked$')
def the_petition_action_is_asked(step, action):
    """
    Ask a request to pep with the action given (with url, data and headers set before)
    :param step:
    :param action:
    :return:
    """
    world.response = requests.request(action.lower(), 'http://{pep_ip}:{pep_port}'.format(pep_ip=world.pep_host_ip,
                                                                                          pep_port=world.pep_port) + world.url,
                                      headers=world.headers, data=world.data)

@step('a KeyPass "([^"]*)" petition is asked to PEP')
def a_keypass_petition_is_asked_to_pep(step, action):
    """
    Set headers (with user, domain and project defined before), payload and action. Then, sent the petition to pep
    :param step:
    :param action:
    :return:
    """
    token = IdmUtils.get_token(world.user, world.user, world.domain, world.ks['platform']['address']['ip'], world.ks['platform']['address']['port'])
    headers = {
        "Accept": "application/json",
        'content-type': 'application/json',
        'Fiware-Servicepath': world.project,
        'Fiware-Service': world.domain,
        'X-Auth-Token': token
    }
    data = {'test_payload': 'test_value'}
    world.data = json.dumps(data)
    world.headers = headers
    world.method = action.lower()
    requests.request(action.lower(), 'http://{pep_ip}:{pep_port}'.format(pep_ip=world.pep_host_ip, pep_port=world.pep_port) +  world.url, headers=headers, data=json.dumps(data))


@step('the request is asked')
def the_request_is_asked(step):
    world.response = requests.request('get', world.url)


@step('a context broker "([^"]*)" petition is asked to PEP with "([^"]*)" format')
def a_context_broker_petition_is_asked_to_pep_with_format(step, action, format):
    """
    Set the header with the format and action given, and the action_type, project, domain and url set before. Then send the request to PEP
    :param step:
    :param action:
    :param format:
    :return:
    """
    token = IdmUtils.get_token(world.user, world.user, world.domain, world.ks['platform']['address']['ip'], world.ks['platform']['address']['port'])
    headers = {
        "Accept": "application/%s" % format,
        'content-type': 'application/%s' % format,
        'Fiware-Servicepath': world.project,
        'Fiware-Service': world.domain,
        'X-Auth-Token': token
    }
    world.headers = headers
    url = 'http://{pep_ip}:{pep_port}'.format(pep_ip=world.pep_host_ip, pep_port=world.pep_port) + world.url
    if hasattr(world, 'action_type') and world.action_type != '':
        if format == 'json':
            data = {
                'updateAction': world.action_type
            }
            world.data = json.dumps(data)
        else:
            data = "<updateAction>%s</updateAction>" % world.action_type
            world.data = data
    else:
        if format == 'json':
            world.data = json.dumps({})
        else:
            world.data = '<xml></xml>'
    try:
        requests.request(action.lower(), url, headers=headers, data=world.data)
    except ConnectionError as e:
        assert False, '''There was an error with the connection with the following data: \n
        \tAction: {action}\n
        \tUrl: {url}\n
        \tHeaders: {headers}\n
        \tData: {data}\n
        \t error: {error}
        '''.format(action=action.lower(), url=url, headers=headers, data=world.data, error=e)


@step('a CEP "([^"]*)" petition is asked to PEP')
def a_cep_petition_is_asked_to_pep(step, action):
    """
    Set the headers with the action given (and the domain and project set before). Then send the request to PEP
    :param step:
    :param action:
    :return:
    """
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




