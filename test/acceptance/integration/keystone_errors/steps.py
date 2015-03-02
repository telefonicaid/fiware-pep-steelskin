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

from lettuce import step, world
from iotqautils.idm_keystone import IdmUtils


@step('headers with bad token')
def headers_with_bad_token(step):
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