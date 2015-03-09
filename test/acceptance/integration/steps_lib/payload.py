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
__author__ = 'Jon Calderin Goñi <jon.caldering@gmail.com>'

from lettuce import step, world
from tools.general_utils import json_to_dict

# Refactor

@step('set the request PAYLOAD as "([^"]*)"')
def set_the_payload_as(step, payload):
    """
    Set the payload to sent
    :param step:
    :param payload:
    :return:
    """
    world.log.info('Setting the payload')
    try:
        world.data = json_to_dict(payload)
    except Exception:
        world.data = payload

@step('add an example of PAYLOAD with "([^"]*)" format')
def add_an_example_of_payload_with_format(step, format):
    """
    Adds a sample payload to the request in the format given
    :param step:
    :param format:
    :return:
    """
    if format == 'json':
        world.data = {'example_payload': 'example_payload'}
    elif format == 'xml':
        world.data = '<example_payload>example_payload<example_payload>'
    else:
        raise ValueError('The format is not supported. Format: {format}'.format(format=format))

@step('add to the payload the Context Broker action "([^"]*)" with format "([^"]*)"')
def adds_to_the_payload_the_context_broker_action_with_format(step, action, format):
    """
    To the current payload, adds at the end, a Context Broker update action given in the format given
    :param step:
    :param action:
    :param format:
    :return:
    """
    world.log.info('Setting the payload')
    if format == 'json':
        if world.data == '':
            world.data = {'updateAction': action}
        else:
            try:
                world.data.update({'updateAction': action})
            except ValueError or NameError or AttributeError:
                world.log.error('The data is not a compatible Json . \n The data is: {data}'.format(data=world.data))
    elif format == 'xml':
        world.data += '<updateAction>{action}</updateAction>'.format(action=action)
    else:
        raise ValueError('The format is not supported. Format: {format}'.format(format=format))
