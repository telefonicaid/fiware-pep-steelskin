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
from iotqautils.idm_keystone import IdmUtils

@step('headers with format "([^"]*)"$')
def headers_with_format(step, format):
    """
    Set headers with the universal user, password, project and domain, and the pyaload format given
    :param step:
    :param format:
    :return:
    """
    token = IdmUtils.get_token(world.ks['user_all'], world.ks['user_all'], world.ks['domain_ok'],
                               world.ks['platform']['address']['ip'], world.ks['platform']['address']['port'])
    world.format = format
    headers = {
        "Accept": "application/%s" % world.format,
        'content-type': 'application/%s' % world.format,
        'Fiware-Servicepath': world.ks['project_ok'],
        'Fiware-Service': world.ks['domain_ok'],
        'X-Auth-Token': token
    }
    world.headers = headers


@step('headers of bad role environment with project')
def headers_of_bad_role_environment_with_project(step):
    """
    Headers configured with an user with bad roles (roles existent in keystone but not in Access Control)
    :param step:
    :return:
    """
    token = IdmUtils.get_token(world.ks['user_all_ko'], world.ks['user_all_ko'], world.ks['domain_ko'], world.ks['platform']['address']['ip'], world.ks['platform']['address']['port'])
    headers = {
        "Accept": "application/json",
        'content-type': 'application/json',
        'Fiware-Servicepath': world.ks['project_ko'],
        'Fiware-Service': world.ks['domain_ko'],
        'X-Auth-Token': token
    }
    world.headers = headers

@step('headers of bad role environment without project')
def headers_of_bad_role_environment_without_project(step):
    """
    Headers configured without project and with an user with bad roles (roles existent in keystone but not in Access Control)
    :param step:
    :return:
    """
    token = IdmUtils.get_token(world.ks['user_all_ko'], world.ks['user_all_ko'], world.ks['domain_ko'], world.ks['platform']['address']['ip'], world.ks['platform']['address']['port'])
    headers = {
        "Accept": "application/json",
        'content-type': 'application/json',
        'Fiware-Servicepath': '/',
        'Fiware-Service': world.ks['domain_ko'],
        'X-Auth-Token': token
    }
    world.headers = headers

@step('headers general')
def headers_general(step):
    """
    A general headers with a universal configuration (User with all roles configured in the project specified)
    :param step:
    :return:
    """
    token = IdmUtils.get_token(world.ks['user_all'], world.ks['user_all'], world.ks['domain_ok'], world.ks['platform']['address']['ip'], world.ks['platform']['address']['port'])
    headers = {
        "Accept": "application/json",
        'content-type': 'application/json',
        'Fiware-Servicepath': world.ks['project_ok'],
        'Fiware-Service': world.ks['domain_ok'],
        'X-Auth-Token': token
    }
    world.headers = headers

@step('headers without the header "([^"]*)"')
def headers_without_the_header(step, header):
    """
    Delete the header given
    :param step:
    :param header:
    :return:
    """
    del world.headers[header]

@step('header "([^"]*)" inexistent in KEYSTONE')
def headers_inexistent_in_keystone(step, header):
    """
    Set the value "inexistant" to the header given
    :param step:
    :param header:
    :return:
    """
    world.headers[header] = 'inexistant'


@step('headers with format "([^"]*)" and "([^"]*)" action')
def headers_with_format_and_action(step, format, action):
    """
    Set headers with the universal domain, user and project, with given format and action
    :param step:
    :param format:
    :param action:
    :return:
    """
    token = IdmUtils.get_token(world.ks['user_all'], world.ks['user_all'], world.ks['domain_ok'], world.ks['platform']['address']['ip'], world.ks['platform']['address']['port'])
    world.format = format
    headers = {
        "Accept": "application/%s" % world.format,
        'content-type': 'application/%s' % world.format,
        'Fiware-Servicepath': world.ks['project_ok'],
        'Fiware-Service': world.ks['domain_ok'],
        'X-Auth-Token': token
    }
    world.headers = headers
    if format == 'json':
        data = {'updateAction': action}
        world.data = json.dumps(data)
    else:
        data = "<updateAction>%s</updateAction>" % action
        world.data = data


@step('the content-type header with the value "([^"]*)"')
def the_content_type_header_with_the_value_group1(step, content_type):
    """
    Set the content-type header
    :param step:
    :param content_type:
    :return:
    """
    world.headers['content-type'] = content_type



@step('headers with bad token')
def headers_with_bad_token(step):
    """
    Headers with universal domain, empty project and bad token
    :param step:
    :return:
    """
    headers = {
        "Accept": "application/json",
        'content-type': 'application/json',
        'Fiware-Servicepath': '/',
        'Fiware-Service': world.ks['domain_ok'],
        'X-Auth-Token': 'badToken'
    }
    world.headers = headers


@step('headers with bad domain')
def headers_with_bad_domain(step):
    """
    Headers with universal user, empty project and bad domain (not existent)
    :param step:
    :return:
    """
    token = IdmUtils.get_token(world.ks['user_all'], world.ks['user_all'], world.ks['domain_ok'],
                               world.ks['platform']['address']['ip'], world.ks['platform']['address']['port'])
    headers = {
        "Accept": "application/json",
        'content-type': 'application/json',
        'Fiware-Servicepath': '/',
        'Fiware-Service': 'bad_domain',
        'X-Auth-Token': token
    }
    world.headers = headers


@step('headers with bad project')
def headers_with_bad_project(step):
    """
    Headers with universal user and domain, but bad project( not exitent)
    :param step:
    :return:
    """
    token = IdmUtils.get_token(world.ks['user_all'], world.ks['user_all'], world.ks['domain_ok'],
                               world.ks['platform']['address']['ip'], world.ks['platform']['address']['port'])
    headers = {
        "Accept": "application/json",
        'content-type': 'application/json',
        'Fiware-Servicepath': 'bad_project',
        'Fiware-Service': world.ks['domain_ok'],
        'X-Auth-Token': token
    }
    world.headers = headers


@step('headers with empty project')
def headers_with_empty_project(step):
    """
    Headers with universal user and domain but empty project
    :param step:
    :return:
    """
    token = IdmUtils.get_token(world.ks['user_all'], world.ks['user_all'], world.ks['domain_ok'],
                               world.ks['platform']['address']['ip'], world.ks['platform']['address']['port'])
    headers = {
        "Accept": "application/json",
        'content-type': 'application/json',
        'Fiware-Servicepath': '',
        'Fiware-Service': world.ks['domain_ok'],
        'X-Auth-Token': token
    }
    world.headers = headers


@step('headers with domain without roles')
def headers_with_domain_without_roles(step):
    """
    Headers with a user and domain configured without roles
    :param step:
    :return:
    """
    token = IdmUtils.get_token(world.ks['user_no_roles'], world.ks['user_no_roles'], world.ks['domain_no_roles'],
                               world.ks['platform']['address']['ip'], world.ks['platform']['address']['port'])
    headers = {
        "Accept": "application/json",
        'content-type': 'application/json',
        'Fiware-Servicepath': '/',
        'Fiware-Service': world.ks['domain_no_roles'],
        'X-Auth-Token': token
    }
    world.headers = headers


@step('headers with project without roles')
def headers_with_project_without_roles(step):
    """
    headers with a user, domain and project without roles configured
    :param step:
    :return:
    """
    token = IdmUtils.get_token(world.ks['user_no_roles'], world.ks['user_no_roles'], world.ks['domain_no_roles'],
                               world.ks['platform']['address']['ip'], world.ks['platform']['address']['port'])
    headers = {
        "Accept": "application/json",
        'content-type': 'application/json',
        'Fiware-Servicepath': world.ks['project_no_roles'],
        'Fiware-Service': world.ks['domain_no_roles'],
        'X-Auth-Token': token
    }
    world.headers = headers