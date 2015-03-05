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