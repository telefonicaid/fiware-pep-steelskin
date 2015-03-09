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

# Refactor*************************************************************

@step('a KEYSTONE CONFIGURATION with all roles in the same project')
def a_keystone_configuration_with_all_roles_in_the_same_project(step):
    """
    There is a configuration in properties with all roles in the same project
    :param step:
    :return:
    """
    world.user = world.ks['user_all']
    world.domain = world.ks['domain_ok']
    world.project = world.ks['project_ok']

@step('a KEYSTONE CONFIGURATION with no roles')
def a_keystone_configuration_with_no_roles(step):
    """
    There is a configuration in properties with user in a domain in a project with no roles
    :param step:
    :return:
    """
    world.user = world.ks['user_no_roles']
    world.domain = world.ks['domain_no_roles']
    world.project = world.ks['project_no_roles']

@step('a KEYSTONE CONFIGURATION with roles not in Access Control')
def a_keystone_configuration_with_roles_not_in_access_control(step):
    """
    There is a configuration in properties with user in a domain in a project with roles
    that not are in Access Control
    :param step:
    :return:
    """
    world.user = world.ks['user_all_ko']
    world.domain = world.ks['domain_ko']
    world.project = world.ks['project_ko']

@step('a KEYSTONE CONFIGURATION with roles in the domains and the user "([^"]*)"')
def a_keystone_configuration_with_role_in_the_domain(step, user):
    """
    There is a configuration in properties with user in a domain with roles
    :param step:
    :param user: The user who contains the role wanted
    :return:
    """
    world.user = world.ks[user]
    world.domain = world.ks['domain_domain_only']
    world.project = world.ks['project_domain_only']

@step('a KEYSTONE CONFIGURATION with roles in projects and the user "([^"]*)"')
def a_keystone_configuration_with_role_in_the_project(step, user):
    """
    There is a configuration in properties with user in a project with roles
    :param step:
    :param user: The user who contains the role wanted
    :return:
    """
    world.user = world.ks[user]
    world.domain = world.ks['domain_project_only']
    world.project = world.ks['project_project_only']

@step('a KEYSTONE CONFIGURATION with the bypass')
def a_keystone_configuration_with_the_bypass(step):
    """
    There is a configuration in properties with bypass configuration
    :param step:
    :return:
    """
    world.user = world.ks['user_bypass']
    world.domain = world.ks['domain_bypass']
    world.project = world.ks['project_bypass']