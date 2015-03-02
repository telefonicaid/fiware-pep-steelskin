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

import requests
import json

from iotqautils.idm_keystone import IdmUtils

from integration.commons import *


@step('a bypass domain in KEYSTONE')
def a_bypass_domain_in_keystone(step):
    """
    Set the domain defined in properties as bypass domain
    :param step:
    :return:
    """
    world.domain = world.ks['domain_bypass']

# FIXME: This step is not real, the parameter is never used, and the assignment of the project is always the same
@step('a "([^"]*)" role in the domain$')
def a_role_in_the_domain(step, role):
    """
    Fake setting project
    :param step:
    :param role: is not used
    :return:
    """
    world.project = '/'

@step('a user bypass in the domain')
def a_user_bypass_in_the_domain(step):
    """
    Set the user defined in properties as bypass user
    :param step:
    :return:
    """
    world.user = world.ks['user_bypass']


@step('a "([^"]*)" role in the project "([^"]*)"')
def a_group1_role_in_the_project_group2(step, role, project):
    """

    :param step:
    :param role:
    :param project:
    :return:
    """
    world.project = world.ks[project]