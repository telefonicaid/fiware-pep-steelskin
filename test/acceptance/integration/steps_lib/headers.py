# -*- coding: utf-8 -*-
"""
Copyright 2015 Telefonica Investigación y Desarrollo, S.A.U

This file is part of fiware-pep-steelskin

fiware-pep-steelskin is free software: you can redistribute it and/or
modify it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the License,
or (at your option) any later version.

fiware-pep-steelskin is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public
License along with fiware-pep-steelskin.
If not, see http://www.gnu.org/licenses/.

For those usages not covered by the GNU Affero General Public License
please contact with::[iot_support@tid.es]
"""
__author__ = 'Jon Calderin Goñi <jon.caldering@gmail.com>'

from lettuce import step, world
from iotqautils.idm_keystone import IdmUtils
from requests.exceptions import ConnectionError


# Refactor ***********************
@step('set the request HEADERS with the previous KEYSTONE CONFIGURATION ant the format "([^"]*)"$')
def headers_with_format(step, format):
    """
    Set headers with:
        - Service (Domain) set before
        - Servicepath (Project) set before
        - Token get before
        - format given
    :param step:
    :param format:
    :return:
    """
    try:
        token = IdmUtils.get_token(world.user, world.user, world.domain, world.ks['platform']['address']['ip'], world.ks['platform']['address']['port'])
    except ConnectionError as e:
        assert False, 'There was a problem getting the token with the connection with Keystone: Ip: {ip} - Port: {port}'.format(ip=world.ks['platform']['address']['ip'], port=world.ks['platform']['address']['port'])
    headers = {
        "accept": "application/%s" % format,
        'content-type': 'application/%s' % format,
        'fiware-servicepath': world.project,
        'fiware-service': world.domain,
        'x-auth-token': token
    }
    world.headers = headers

@step('set the header "([^"]*)" with the value "([^"]*)"')
def set_the_header_with_the_value(step, header, value):
    """
    Set a specific header with an specific value
    :param step:
    :param header:
    :param value:
    :return:
    """
    header = header.lower()
    if isinstance(world.headers, dict):
        if header in world.headers:
            world.headers[header] = value
        else:
            world.headers.update({header: value})
    else:
        world.headers = {header: value}

@step('remove the header "([^"]*)" from headers')
def remove_the_header_from_headers(step, header):
    """
    Delete the header given
    :param step:
    :param header:
    :return:
    """
    del world.headers[header.lower()]
#***********************