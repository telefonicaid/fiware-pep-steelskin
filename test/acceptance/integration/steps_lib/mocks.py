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

import urlparse
import requests
from requests.exceptions import ConnectionError
from lettuce import step, world
from tools.general_utils import check_equals, urlparseargs_to_nodejsargs, equals_objects, json_to_dict


@step('the petition gets to the mock')
def the_petition_gets_to_the_mock(step):
    """
    Check the petition gets to the mock with the data sent
    :param step:
    :return:
    """
    mock_url = 'http://{mock_ip}:{mock_port}/last_value'.format(mock_ip=world.mock['ip'], mock_port=world.mock['port'])
    try:
        resp = requests.get(mock_url)
    except ConnectionError as e:
        assert False, 'There is a problem with the connection to the mock in the url: {url} \n Error: {error}'.format(
            url=mock_url, error=e)
    assert not (len(set(resp.json().values())) <= 1), 'The petition never gets to the mock. Mock data: {resp}'.format(
        resp=resp.json())
    # Check headers
    headers = resp.json()['headers']
    try:
        headers = eval(headers)
    except:
        raise TypeError('The headers are not a dict type, the headers are: {headers}'.format(headers=headers))
    check_equals(world.headers, headers, ['accept', 'content-type', 'fiware-servicepath', 'fiware-service'])
    assert "x-auth-token" not in headers, "The x-auth-token don't have to go to the endpoint"
    # Check parms
    parms_received = resp.json()['parms']
    if parms_received == '{}':
        parms_received = ''
    else:
        parms_received = eval(parms_received)
    parms_send = urlparseargs_to_nodejsargs(world.url)
    msg_not_equals = 'The parms sent to PEP are not the same than the parms send to final: \n Parm send: {parms_send} \n Parm received: {parms_received}'.format(
        parms_send=parms_send, parms_received=parms_received)
    equals_objects(parms_received, parms_send, msg_not_equals)
    # Check path
    path_send = urlparse.urlsplit(world.url).path
    path_received = resp.json()['path']
    assert path_send == path_received, 'The path sent to PEP are not the same than the path send to final: \n Path_sent: {path_send} \n Path received: {path_received}'.format(
        path_send=path_send, path_received=path_received)
    # Check the payload
    if type(world.data) is dict:
        sent = world.data
    elif type(world.data) is str or type(world.data) is unicode:
        try:
            sent = json_to_dict(world.data)
        except:
            sent = world.data
    try:
        response = json_to_dict(resp.json()['resp'])
    except Exception as e:
        try:
            response = resp.json()['resp']
        except ValueError as e:
            assert False, 'The info returned by the mock is: {response}'.format(response=resp.text)
    assert sorted(sent) == sorted(response), 'The payload sent is "%s (%s)" and the payload proxied is "%s (%s)"' % (
        sent, type(sent), response, type(response))
    assert resp.status_code == 200, 'The response code is not 200, is: %s' % resp.status_code


