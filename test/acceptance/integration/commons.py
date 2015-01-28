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
If not, seehttp://www.gnu.org/licenses/.

For those usages not covered by the GNU Affero General Public License
please contact with::[iot_support@tid.es]
"""
from iotqautils.idm_keystone import IdmUtils
from tools.deploy_pep import start_docker_pep
from tools.general_utils import set_config_cb, set_config_keypass, set_config_perseo, set_config_bypass, \
    set_config_cache_projects, set_config_cache_roles, set_config_cache_gradual, start_pep, start_pep_app

__author__ = 'Jon'

from lettuce import world, step
import requests
import json
import time
from requests.exceptions import ConnectionError


@step('a url with "([^"]*)"')
def a_url_with_url(step, url):
    world.url = url


@step('a project in the user')
def a_project_in_the_user(step):
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
    found = False
    if world.ks['domain_ok'] in [x['name'] for x in world.ks['environment_general']['domains']]:
        found = True
        world.domain = world.ks['domain_ok']
    assert found, 'the domain ok is not defined'


@step('a domain for project_only in KEYSTONE')
def a_domain_for_project_only_in_keystone(step):
    found = False
    if world.ks['domain_project_only'] in [x['name'] for x in world.ks['environment_project']['domains']]:
        found = True
        world.domain = world.ks['domain_project_only']
    assert found, 'The domain for roles only in projects is not defined'


@step('a without role in domain and with "([^"]*)" user in project')
def a_without_role_user(step, user):
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
    found = False
    if world.ks['domain_domain_only'] in [x['name'] for x in world.ks['environment_domain']['domains']]:
        found = True
        world.domain = world.ks['domain_domain_only']
    assert found, "The domain is not in the keystone structure"


@step('a "([^"]*)" user in domain without projects')
def a_group1_user_in_domain_without_projects(step, user):
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


@step('the petition gets to the mock')
def the_petition_gets_to_contextbroker_mock(step):
    mock_url = 'http://{mock_ip}:{mock_port}/last_value'.format(mock_ip=world.mock['ip'], mock_port=world.mock['port'])
    try:
        resp = requests.get(mock_url)
    except ConnectionError as e:
        assert False, 'There is a problem with the connection to the mock in the url: {url} \n Error: {error}'.format(
            url=mock_url, error=e)
    try:
        sent = eval(world.data)
        response = eval(json.loads(resp.text)['resp'])
    except Exception as e:
        sent = world.data
        try:
            response = json.loads(resp.text)['resp']
        except ValueError as e:
            assert False, 'The info returned by the mock is: {response}'.format(response=resp.text)
    assert sent == response, 'The payload sent is "%s (%s)" and the payload proxied is "%s (%s)"' % (
        sent, type(sent), response, type(response))
    assert resp.status_code == 200, 'The response code is not 200, is: %s' % resp.status_code


@step("the Context Broker configuration")
def step_impl(step):
    """
    :type step lettuce.core.Step
    """
    if world.config_set != 'cb':
        world.config_set = 'cb'
        set_config_cb()
        start_pep_app()
        time.sleep(5)


@step("the cache gradual configuration")
def step_impl(step):
    """
    :type step lettuce.core.Step
    """

    world.config_set = 'cache_gradual'
    set_config_cache_gradual()
    start_pep_app()
    time.sleep(5)


@step("the cache projects configuration")
def step_impl(step):
    """
    :type step lettuce.core.Step
    """
    world.config_set = 'cache_projects'
    set_config_cache_projects()
    start_pep_app()
    time.sleep(5)


@step("the cache roles configuration")
def step_impl(step):
    """
    :type step lettuce.core.Step
    """
    world.config_set = 'cache_roles'
    set_config_cache_roles()
    start_pep_app()
    time.sleep(5)


@step("the Keypass configuration")
def step_impl(step):
    """
    :type step lettuce.core.Step
    """
    if world.config_set != 'ks':
        world.config_set = 'ks'
        set_config_keypass()
        start_pep_app()
        time.sleep(5)


@step("the Perseo configuration")
def step_impl(step):
    """
    :type step lettuce.core.Step
    """
    if world.config_set != 'cep':
        world.config_set = 'cep'
        set_config_perseo()
        start_pep_app()
        time.sleep(5)


@step("the Bypass configuration")
def step_impl(step):
    """
    :type step lettuce.core.Step
    """
    if world.config_set != 'bypass':
        world.config_set = 'bypass'
        set_config_bypass()
        start_pep_app()
        time.sleep(5)


@step('the keystone proxy history reset')
def the_keystone_proxy_history_reset(step):
    requests.request('get', 'http://{ks_proxy_ip}:{ks_proxy_port}/reset_history'.format(ks_proxy_ip=world.ks_proxy_ip,
                                                                                        ks_proxy_port=world.ks_proxy_port))


@step('the petition action "([^"]*)" is asked without data')
def the_petition_is_asked(step, action):
    world.response = requests.request(action.lower(), 'http://{pep_ip}:{pep_port}/'.format(pep_ip=world.pep_host_ip,
                                                                                           pep_port=world.pep_port) + world.url,
                                      headers=world.headers, data={})


@step('the Keystone proxy receive the last petition "([^"]*)" from PEP')
def the_keystone_proxy_doesnt_receive_any_petition(step, last_petition):
    resp = requests.request('GET',
                            'http://{ks_proxy_ip}:{ks_proxy_port}/last_path'.format(ks_proxy_ip=world.ks_proxy_ip,
                                                                                    ks_proxy_port=world.ks_proxy_port)).text
    assert resp == last_petition, 'The last petition done to ks is not the defined in the test'


@step('the PEP returns an error')
def the_pep_returns_an_error(step):
    assert str(world.response.status_code) == '403', 'PEP dontr returnet the error expected (403)'


@step('headers with format "([^"]*)"$')
def with_format_group1(step, format):
    token = IdmUtils.get_token(world.ks['user_all'], world.ks['user_all'], world.ks['domain_ok'],
                               world.ks['platform']['address']['ip'], world.ks['platform']['address']['port'])
    world.format = format
    headers = {
        "Accept": "application/%s" % world.format,
        'content-type': 'application/%s' % world.format,
        'Fiware-Servicepath': '/',
        'Fiware-Service': world.ks['domain_ok'],
        'X-Auth-Token': token
    }
    world.headers = headers