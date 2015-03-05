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

@step('a project in the user')
def a_project_in_the_user(step):
    """
    Set the project, checking if it exist in the configuration
    :param step:
    :return:
    """
    found = False
    for domain in world.ks['environment_general']['domains']:
        if domain['name'] == world.ks['domain_ok']:
            for user in domain['users']:
                if user['name'] == world.ks['user_all']:
                    if world.ks['project_ok'] in [project['name'] for project in user['projects']]:
                        found = True
                        world.project = world.ks['project_ok']
                        break
    assert found, 'The project ok is not defined'


@step("a user in the domain")
def a_user_in_the_domain(step):
    """
    Set the user checking if it exist in the configuration
    :param step:
    :return:
    """
    found = False
    for domain in world.ks['environment_general']['domains']:
        if domain['name'] == world.ks['domain_ok']:
            if world.ks['user_all'] in [user['name'] for user in domain['users']]:
                found = True
                world.user = world.ks['user_all']
                break
    assert found, 'The user ok is not defined'


@step('a domain in KEYSTONE')
def a_domain_in_keystone(step):
    """
    Set the domain checking if it exist in the configuration
    :param step:
    :return:
    """
    found = False
    if world.ks['domain_ok'] in [x['name'] for x in world.ks['environment_general']['domains']]:
        found = True
        world.domain = world.ks['domain_ok']
    assert found, 'the domain ok is not defined'


@step('a domain for project_only in KEYSTONE')
def a_domain_for_project_only_in_keystone(step):
    """
    Set a domain configured with toles only in project
    :param step:
    :return:
    """
    found = False
    if world.ks['domain_project_only'] in [x['name'] for x in world.ks['environment_project']['domains']]:
        found = True
        world.domain = world.ks['domain_project_only']
    assert found, 'The domain for roles only in projects is not defined'


@step('a without role in domain and with "([^"]*)" user in project')
def a_without_role_in_domain_and_with_user_in_project(step, user):
    """
    Set a user with role given in project and not in domain
    :param step:
    :param user:
    :return:
    """
    found = False
    for domain in world.ks['environment_project']['domains']:
        if domain['name'] == world.ks['domain_project_only']:
            if world.ks[user] in [user_['name'] for user_ in domain['users']]:
                found = True
                world.user = world.ks[user]
                break
    assert found, 'The user without role is not defined'


@step('a "([^"]*)" role in the user project')
def a_role_in_the_user_project(step, role):
    """
    Set a project withe the role given
    :param step:
    :param role:
    :return:
    """
    found = False
    for domain in world.ks['environment_project']['domains']:
        if domain['name'] == world.domain:
            for user in domain['users']:
                if user['name'] == world.user:
                    if user['projects'][0]['roles'][0]['name'] == world.ac[role]:
                        found = True
                        world.project = user['projects'][0]['name']
                        break
    assert found, 'The role is not in the user project'


@step('a domain without projects in KEYSTONE')
def a_domain_without_projects_in_keystone(step):
    """
    Set a domain without projects configured in keystone
    :param step:
    :return:
    """
    found = False
    if world.ks['domain_domain_only'] in [x['name'] for x in world.ks['environment_domain']['domains']]:
        found = True
        world.domain = world.ks['domain_domain_only']
    assert found, "The domain is not in the keystone structure"


@step('a "([^"]*)" user in domain without projects')
def a_user_in_domain_without_projects(step, user):
    """
    Set a user given without projects in the domain
    :param step:
    :param user:
    :return:
    """
    found = False
    for domain in world.ks['environment_domain']['domains']:
        if domain['name'] == world.ks['domain_domain_only']:
            if world.ks['user_create_domain'] in [user_['name'] for user_ in domain['users']]:
                found = True
                world.user = world.ks[user]
                break
    assert found, 'the user is not defined in the domain without projects'


@step('a "([^"]*)" role in the user and domain')
def a_role_in_the_user_and_domain(step, role):
    """
    Set the project with '/' if the role given is configured in the domain
    :param step:
    :param role:
    :return:
    """
    found = False
    for domain in world.ks['environment_domain']['domains']:
        if domain['name'] == world.domain:
            for user in domain['users']:
                if user['name'] == world.user:
                    if user['roles'][0]['name'] == world.ac[role]:
                        found = True
                        world.project = '/'
                        break
    assert found, 'The role is not in the user and domain'


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