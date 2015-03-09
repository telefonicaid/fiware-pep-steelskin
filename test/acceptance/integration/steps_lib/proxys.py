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
import requests

@step('the keystone proxy history reset')
def the_keystone_proxy_history_reset(step):
    """
    Reset the history of the keystone proxy
    :param step:
    :return:
    """
    requests.request('get', 'http://{ks_proxy_ip}:{ks_proxy_port}/reset_history'.format(ks_proxy_ip=world.ks_proxy_ip,
                                                                                        ks_proxy_port=world.ks_proxy_port))

@step('the Keystone proxy receive the last petition "([^"]*)" from PEP')
def the_keystone_proxy_receive_the_last_petition_from_pep(step, last_petition):
    """
    Check if the last path proxy received is the same as given one
    :param step:
    :param last_petition:
    :return:
    """
    resp = requests.request('GET',
                            'http://{ks_proxy_ip}:{ks_proxy_port}/last_path'.format(ks_proxy_ip=world.ks_proxy_ip,
                                                                                    ks_proxy_port=world.ks_proxy_port)).text
    assert resp == last_petition, 'The last petition done to KS is not the defined in the test, \n\tdefined: {done}\n\tdone: {resp}'.format(
        resp=resp, done=last_petition)



@step('the access control proxy receive the last petition "([^"]*)" from PEP')
def the_access_control_proxy_receive_the_last_petition(step, last_petition):
    """
    Check the access control proxy and assert if the las petition given is the las petition asked by pep to access control
    :param step:
    :param last_petition:
    :return:
    """
    resp = requests.request('GET', 'http://{ac_proxy_ip}:{ac_proxy_port}/last_path'.format(ac_proxy_ip=world.ac_proxy_ip, ac_proxy_port=world.ac_proxy_port)).text
    assert resp == last_petition, 'The last petition done to ac is not the defined in the test'


@step('the history is saved$')
def the_history_is_saved(step):
    """
    Get the keystone history from the proxy
    :param step:
    :return:
    """
    resp = requests.request('GET', 'http://{ks_proxy_ip}:{ks_proxy_port}/history'.format(ks_proxy_ip=world.ks_proxy_ip, ks_proxy_port=world.ks_proxy_port)).text
    world.history = resp

@step('the history is the same as saved')
def the_history_is_the_same_as_saved(step):
    """
    Check the history saved has not changed
    :param step:
    :return:
    """
    resp = requests.request('GET', 'http://{ks_proxy_ip}:{ks_proxy_port}/history'.format(ks_proxy_ip=world.ks_proxy_ip, ks_proxy_port=world.ks_proxy_port)).text
    assert world.history == resp, 'The history changed, it has to be equal'


@step('the history of petitions adds "([^"]*)" petition')
def the_history_off_petitions_adds_a_petition(step, petitions_added):
    """
    Check if the history has more petitions than before, when it was saved
    :param step:
    :param petitions_added:
    :return:
    """
    resp = requests.request('GET', 'http://{ks_proxy_ip}:{ks_proxy_port}/history'.format(ks_proxy_ip=world.ks_proxy_ip, ks_proxy_port=world.ks_proxy_port)).text
    history_list = eval(world.history)
    history_new_list = eval(resp)
    world.last_petition_added = history_new_list[len(history_new_list)-1]
    assert len(history_list)+int(petitions_added) == len(history_new_list), 'The petitions added to the history are not the expected'


@step('the value added to the history is a request of the cache expired')
def the_value_added_to_the_history_is_ok(step):
    """
    Check if the last petition is the same as the new petition saved
    :param step:
    :return:
    """
    assert world.new_petition == world.last_petition_added, 'The petition asked is not the expected'
