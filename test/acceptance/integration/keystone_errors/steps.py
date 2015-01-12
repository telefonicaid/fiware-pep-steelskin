# -*- coding: utf-8 -*-
"""
(c) Copyright 2014 Telefonica, I+D. Printed in Spain (Europe). All Rights
Reserved.

The copyright to the software program(s) is property of Telefonica I+D.
The program(s) may be used and or copied only with the express written
consent of Telefonica I+D or in accordance with the terms and conditions
stipulated in the agreement/contract under which the program(s) have
been supplied.
"""
from iotqautils.idm_keystone import IdmUtils

__author__ = 'Jon'

from lettuce import step, world


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
    token = IdmUtils.get_token(world.ks['user_all'], world.ks['user_all'], world.ks['domain_ok'], world.ks['platform']['address']['ip'])
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
    token = IdmUtils.get_token(world.ks['user_all'], world.ks['user_all'], world.ks['domain_ok'], world.ks['platform']['address']['ip'])
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
    token = IdmUtils.get_token(world.ks['user_all'], world.ks['user_all'], world.ks['domain_ok'], world.ks['platform']['address']['ip'])
    headers = {
        "Accept": "application/json",
        'content-type': 'application/json',
        'Fiware-Servicepath': '',
        'Fiware-Service': world.ks['domain_ok'],
        'X-Auth-Token': token
    }
    world.headers = headers

@step('headers with domain without roles')
def headers_with_empty_project(step):
    token = IdmUtils.get_token(world.ks['user_no_roles'], world.ks['user_no_roles'], world.ks['domain_no_roles'], world.ks['platform']['address']['ip'])
    headers = {
        "Accept": "application/json",
        'content-type': 'application/json',
        'Fiware-Servicepath': '/',
        'Fiware-Service': world.ks['domain_no_roles'],
        'X-Auth-Token': token
    }
    world.headers = headers

@step('headers with project without roles')
def headers_with_empty_project(step):
    token = IdmUtils.get_token(world.ks['user_no_roles'], world.ks['user_no_roles'], world.ks['domain_no_roles'], world.ks['platform']['address']['ip'])
    headers = {
        "Accept": "application/json",
        'content-type': 'application/json',
        'Fiware-Servicepath': world.ks['project_no_roles'],
        'Fiware-Service': world.ks['domain_no_roles'],
        'X-Auth-Token': token
    }
    world.headers = headers