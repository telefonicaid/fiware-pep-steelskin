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
from iotqautils.idm_keystone import IdmUtils
from tools.deploy_pep import start_docker_pep
from tools.general_utils import set_config_cb, set_config_keypass, set_config_perseo, set_config_bypass, \
    set_config_cache_projects, set_config_cache_roles, set_config_cache_gradual, start_pep, start_pep_app

__author__ = 'Jon Calderin Goñi <jon.caldering@gmail.com>'

from lettuce import world, step
import requests
import json
import time
from requests.exceptions import ConnectionError
from tools.general_utils import *
import urlparse


@step('a url with "([^"]*)"')
def a_url_with_url(step, url):
    """
    Set the url
    :param step:
    :param url:
    :return:
    """
    world.url = url


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
    assert not (len(set(resp.json().values())) <= 1), 'The petition never gets to the mock'
    # Check headers
    headers = resp.json()['headers']
    try:
        headers = eval(headers)
    except:
        raise TypeError('The headers are not a dict type, the headers are: {headers}'.format(headers=headers))
    check_equals(headers, world.headers, ['accept', 'content-type', 'fiware-servicepath', 'fiware-service'])
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
            sent = json.loads(world.data.replace('\'', '"'))
        except:
            sent = world.data
    try:
        response = json.loads(json.loads(resp.text)['resp'].replace('\'', '"'))
    except Exception as e:
        try:
            response = json.loads(resp.text)['resp']
        except ValueError as e:
            assert False, 'The info returned by the mock is: {response}'.format(response=resp.text)
    assert sorted(sent) == sorted(response), 'The payload sent is "%s (%s)" and the payload proxied is "%s (%s)"' % (
        sent, type(sent), response, type(response))
    assert resp.status_code == 200, 'The response code is not 200, is: %s' % resp.status_code


@step("the Context Broker configuration")
def the_context_broker_configuration(step):
    """
    Set the context broker plugin (if it is not set) and restart pep
    :type step lettuce.core.Step
    """
    if world.config_set != 'cb':
        world.config_set = 'cb'
        set_config_cb()
        start_pep_app()
        time.sleep(5)


@step("the Headers Context Broker configuration without cache")
def the_headers_context_broker_configuration_without_cache(step):
    """
    Set the context broker plugin (if it is not set) without cache
    :type step lettuce.core.Step
    """
    if world.config_set != 'head':
        world.config_set = 'head'
        set_cb_config_withour_cache()
        start_pep_app()
        time.sleep(5)


@step("restart pep with bad ks configuration")
def restart_pep_with_bad_ks_configuration(step):
    """
    Set the context broker plugin (if it is not set) setting a bad ip of kesytone
    :type step lettuce.core.Step
    """
    if world.config_set != 'bad_ks':
        world.config_set = 'bad_ks'
        set_cb_config_with_bad_ks_ip()
        start_pep_app()
        time.sleep(5)

@step("restart pep with bad ac configuration")
def restart_pep_with_bad_ac_configuration(step):
    """
    Set the context broker plugin (if it is not set) setting a bad ip of access control
    :type step lettuce.core.Step
    """
    if world.config_set != 'bad_ac':
        world.config_set = 'bad_ac'
        set_cb_config_with_bad_ac_ip()
        start_pep_app()
        time.sleep(5)

@step("restart pep with bad target configuration")
def restart_pep_with_bad_target_configuration(step):
    """
    Set the context broker plugin (if it is not set) setting a bad ip of target
    :type step lettuce.core.Step
    """
    if world.config_set != 'bad_target':
        world.config_set = 'bad_target'
        set_cb_config_with_bad_target_ip()
        start_pep_app()
        time.sleep(5)

@step("restart pep with bad pep user")
def restart_pep_with_bad_pep_user(step):
    """
    Set the context broker plugin (if it is not set) setting a bad pep user credential
    :type step lettuce.core.Step
    """
    if world.config_set != 'bad_pep_user':
        world.config_set = 'bad_pep_user'
        set_cb_config_with_bad_pep_user()
        start_pep_app()
        time.sleep(5)


@step("the cache gradual configuration")
def the_cache_gradual_configuration(step):
    """
    Set the context broker plugin setting the cache expired time gradual
    :type step lettuce.core.Step
    """
    world.config_set = 'cache_gradual'
    set_config_cache_gradual()
    start_pep_app()
    time.sleep(5)


@step("the cache projects configuration")
def the_cache_projects_configuration(step):
    """
    Set the context broker plugin setting the cache project expire first
    :type step lettuce.core.Step
    """
    world.config_set = 'cache_projects'
    set_config_cache_projects()
    start_pep_app()
    time.sleep(5)


@step("the cache roles configuration")
def the_cache_roles_configuration(step):
    """
    Ste the context broker plugin setting the cache roles expire first
    :type step lettuce.core.Step
    """
    world.config_set = 'cache_roles'
    set_config_cache_roles()
    start_pep_app()
    time.sleep(5)


@step("the Keypass configuration")
def the_keystone_configuration(step):
    """
    Set the keypass (Access Control) configuration (if it is not set) and restart pep
    :type step lettuce.core.Step
    """
    if world.config_set != 'ks':
        world.config_set = 'ks'
        set_config_keypass()
        start_pep_app()
        time.sleep(5)


@step("the Perseo configuration")
def the_perseo_configuration(step):
    """
    Set the CEP (Perseo) configuration (if it is not set) and restart pep
    :type step lettuce.core.Step
    """
    if world.config_set != 'cep':
        world.config_set = 'cep'
        set_config_perseo()
        start_pep_app()
        time.sleep(5)


@step("the Bypass configuration")
def the_bypass_configuration(step):
    """
    Seth the context broker configuration (if its not set) setting the bypass configuration (enabling it)
    :type step lettuce.core.Step
    """
    if world.config_set != 'bypass':
        world.config_set = 'bypass'
        set_config_bypass()
        start_pep_app()
        time.sleep(5)


@step('the keystone proxy history reset')
def the_keystone_proxy_history_reset(step):
    """
    Reset the history of the keystone proxy
    :param step:
    :return:
    """
    requests.request('get', 'http://{ks_proxy_ip}:{ks_proxy_port}/reset_history'.format(ks_proxy_ip=world.ks_proxy_ip,
                                                                                        ks_proxy_port=world.ks_proxy_port))


@step('the petition action "([^"]*)" is asked without data')
def the_petition_action_is_asked_without_data(step, action):
    """
    Ask a request to pep without data (with the url and headers set before)
    :param step:
    :param action:
    :return:
    """
    world.response = requests.request(action.lower(), 'http://{pep_ip}:{pep_port}'.format(pep_ip=world.pep_host_ip,
                                                                                          pep_port=world.pep_port) + world.url,
                                      headers=world.headers, data=json.dumps({}))


@step('the petition action "([^"]*)" is asked$')
def the_petition_action_is_asked(step, action):
    """
    Ask a request to pep with the action given (with url, data and headers set before)
    :param step:
    :param action:
    :return:
    """
    world.response = requests.request(action.lower(), 'http://{pep_ip}:{pep_port}'.format(pep_ip=world.pep_host_ip,
                                                                                          pep_port=world.pep_port) + world.url,
                                      headers=world.headers, data=world.data)


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


@step('the PEP returns an error$')
def the_pep_returns_an_error(step):
    """
    Check if PEP returns any http error
    :param step:
    :return:
    """
    assert str(
        world.response.status_code) != '200', 'PEP do not return the error expected (403), returned: {error_returnet}'.format(
        error_returnet=str(world.response.status_code))

@step('the PEP returns an error with code "([^"]*)"$')
def the_pep_returns_an_error_with_code(step, error_code):
    """
    Check if PEP returns an specific http error given
    :param step:
    :param error_code:
    :return:
    """
    assert str(
        world.response.status_code) == error_code, 'PEP do not return the error expected ({error_code}), returned: {error_returnet}'.format(
        error_returnet=str(world.response.status_code), error_code=error_code)

@step('the PEP returns an error with code "([^"]*)" and name "([^"]*)"')
def the_pep_returns_an_error_with_code_and_name(step, error_code, error_name):
    """
    Check if PEP returns the given error with the given name
    :param step:
    :param error_code:
    :param error_name:
    :return:
    """
    assert str(
        world.response.status_code) == error_code and world.response.json()['name'] == error_name, 'PEP do not return \
        the error expected ({error_code_expected}), returned: {error_returned} \
        or error name expected {error_name_expected}, returned: {error_name_returned}'\
        .format(error_returned=str(world.response.status_code), error_code_expected=error_code,
                error_name_expected=error_name, error_name_returned=world.response.json()['name'])


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

@step('restart "([^"]*)" process with bad final component port')
def restart_process_with_nad_final_component_port(step, component):
    """
    Restart a proxy or mock given with a bad port configuration for the final target
    :param step:
    :param component:
    :return:
    """
    if component == 'ks':
        stop_process(world.ks_proxy)
        world.ks_proxy = start_proxy(world.ks_proxy_bind_ip, world.ks_proxy_port, world.ks['platform']['address']['ip'],
                                     9876)
        world.ks_faked = True
    elif component == 'ac':
        stop_process(world.ac_proxy)
        world.ac_proxy = start_proxy(world.ac_proxy_bind_ip, world.ac_proxy_port, world.ac['ip'], 9875)
        world.ac_faked = True
    elif component == 'target':
        stop_process(world.mock_dest)
        world.mock_dest = start_mock('mock.py', world.mock['ip'], 9874)
        world.target_faked = True
    else:
        raise ValueError('The process indicated is wrong, the possible values are "ks", "ac" or "target", \
        and the indicated process is: {component}'.format(component=component))
    time.sleep(3)

@step('restart "([^"]*)" process with bad proxy port')
def restar_process_with_bad_proxy_port(step, component):
    """
    Restart a proxy with a bad port
    :param step:
    :param component:
    :return:
    """
    if component == 'ks':
        stop_process(world.ks_proxy)
        world.ks_proxy = start_proxy(world.ks_proxy_bind_ip, 9876, world.ks['platform']['address']['ip'],
                                     world.ks['platform']['address']['port'])
        world.ks_faked = True
    elif component == 'ac':
        stop_process(world.ac_proxy)
        world.ac_proxy = start_proxy('1.1.1.1', 9875, world.ac['ip'], world.ac['port'])
        world.ac_faked = True
    else:
        raise ValueError('The process indicated is wrong, the possible values are "ks" or "ac", \
        and the indicated process is: {component}'.format(component=component))
    time.sleep(3)


@step('restore the process "([^"]*)"')
def restore_the_process(step, component):
    """
    Restart a proxy or mock given with the correct configuration
    :param step:
    :param component:
    :return:
    """
    if component == 'ks':
        stop_process(world.ks_proxy)
        world.ks_proxy = start_proxy(world.ks_proxy_bind_ip, world.ks_proxy_port, world.ks['platform']['address']['ip'],
                                     world.ks['platform']['address']['port'])
        world.ks_faked = False
    elif component == 'ac':
        stop_process(world.ac_proxy)
        world.ac_proxy = start_proxy(world.ac_proxy_bind_ip, world.ac_proxy_port, world.ac['ip'], world.ac['port'])
        world.ac_faked = False
    elif component == 'target':
        stop_process(world.mock_dest)
        world.mock_dest = start_mock('mock.py', world.mock['ip'], world.mock['port'])
        world.target_faked = False
    else:
        raise ValueError('The process indicated is wrong, the possible values are "ks", "ac" or "target", \
        and the indicated process is: {component}'.format(component=component))
    time.sleep(3)