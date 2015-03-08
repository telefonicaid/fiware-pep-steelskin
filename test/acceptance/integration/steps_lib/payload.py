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

__author__ = 'Jon Calderin Goñi <jon.caldering@gmail.com>'

from lettuce import step, world

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


# Refactor

@step('set the payload as "([^"]*)"')
def set_the_payload_as(step, payload):
    """
    Set the payload to sent
    :param step:
    :param payload:
    :return:
    """
    world.log.info('Setting the payload')
    try:
        world.data = json.dumps(eval(payload))
        world.log.debug('Set the data as a dict, with eval')
    except NameError as e:
        world.log.error('Error setting the payload as a python dict: {exception}'.format(exception=e.message))
        try:
            world.data = json.dumps(json.loads(payload))
            world.log.debug('Set the data as dict with json.loads')
        except ValueError as e2:
            world.log.error('Error setting the payload as a json loads: {excepction}'.format(exception=e2.message))
            world.data = payload
            world.log.debug('Set the data as text')