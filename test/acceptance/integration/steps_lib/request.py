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

import json
import requests
from requests.exceptions import ConnectionError
from tools.general_utils import pretty_request, pretty_response
from lettuce import step, world



@step('set the request METHOD as "([^"]*)"')
def set_the_request_method_as(step, method):
    """
    Set the request method in lower case
    :param step:
    :param method:
    :return:
    """
    world.method = method.lower()

@step('the request built before is sent to PEP')
def a_request_is_sent_to_pep_with_the_request_built_before(step):
    """
    Send a request to PEP with the request built before
    :param step:
    :return:
    """

    world.log.info("Senting the request to PEP")
    assert hasattr(world, 'url'), 'The world instance has no URL defined'
    # Add url to the request
    world.request_parms = dict({'url': world.url})
    # Add headers to the request
    if hasattr(world, 'headers'):
        if isinstance(world.headers, dict):
            if world.headers != {}:
                world.request_parms.update({'headers': world.headers})
    # Add payload to the request , if its empty is not sent
    if hasattr(world, 'data'):
        if isinstance(world.data, dict):
            if world.data != {}:
                world.request_parms.update({'data': json.dumps(world.data)})
        else:
            if world.data != '':
                world.request_parms.update({'data': world.data})
    # Add method to the request
    assert hasattr(world, 'method'), 'The world instance has no METHOD defined'
    world.request_parms.update({'method': world.method})
    # *******
    if hasattr(world, 'request_parms') and all(x in world.request_parms for x in ['url', 'method']):
        try:
            world.log.debug('Parameters to send: {parameters}'.format(parameters=pretty_request(**world.request_parms)))
            world.response = requests.request(**world.request_parms)
            world.log.debug('The response of the PEP is: {pep_response}'.format(pep_response=pretty_response(world.response)))
        except ConnectionError:
            raise ConnectionError('There where a problem connecting with PEP, the request is {request}'.format(request=pretty_request(**world.request_parms)))
    else:
        raise ValueError('The request_parms is not built correct. The request is {request}'.format(request=pretty_request(**world.request_parms)))





