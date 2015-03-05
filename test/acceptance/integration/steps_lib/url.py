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

@step('a url with "([^"]*)"')
def a_url_with_url(step, url):
    """
    Set the url
    :param step:
    :param url:
    :return:
    """
    world.url = url

@step('the url and path of pep version')
def the_url_and_path_of_pep_version(step):
    world.url = 'http://{pep_ip}:{pep_port}'.format(pep_ip=world.pep_host_ip,
                                                    pep_port=world.administration_port) + '/version'


@step('url with "([^"]*)" and the actionType attribute "([^"]*)"')
def a_url_with_group1_and_the_actiontype_attribute_group2(step, url, action_type):
    """
    Define the url and the action type sent in the payload
    :param step:
    :param url:
    :param action_type:
    :return:
    """
    world.url = url
    world.action_type = action_type