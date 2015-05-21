# -*- coding: utf-8 -*-
"""
Copyright 2014 Telefonica Investigación y Desarrollo, S.A.U

This file is part of fiware-pep-steelskin

fiware-pep-steelskin is free software: you can redistribute it and/or
modify it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the License,
or (at your option) any later version.

fiware-pep-steelskin is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public
License along with fiware-pep-steelskin.
If not, see http://www.gnu.org/licenses/.

For those usages not covered by the GNU Affero General Public License
please contact with::[iot_support@tid.es]
"""
import json
import urlparse

__author__ = 'Jon Calderin Goñi <jon.caldering@gmail.com>'

import time
import subprocess
import os
import collections
import platform
from iotqautils.accessControl import AC
from iotqautils.idm_keystone import IdmUtils
from lettuce import world
from deploy_pep import *
import psutil
from requests.exceptions import ConnectionError


def json_to_dict(json_object):
    """
    Returns a dict with the json text, dict or list
    :param json_object:
    :return:
    """
    if isinstance(json_object, dict) or isinstance(json_object, list):
        return json_object
    elif isinstance(json_object, str) or isinstance(json_object, unicode):
        try:
            return eval(json_object)
        except Exception:
            try:
                return json.loads(json_object)
            except Exception:
                json_object = json_object.replace('\'', '"').replace('None', 'null').replace('True', 'true').replace(
                    'False', 'false')
                return json.loads(json_object)

def pretty(json_pret):
    """
    Return a json in pretty format
    :param json_pret:
    :return:
    """
    return json.dumps(json_pret, sort_keys=True, indent=4, separators=(',', ': '))


def pretty_request(**request_parms):
    """
    Print in a pretty way all request information
    :param request_parms:
    :return:
    """
    pretty_request = '\n'
    if 'url' in request_parms:
        pretty_request += '\tURL: {url}\n'.format(url=request_parms['url'])
    if 'headers' in request_parms:
        pretty_request += '\tHeaders: {headers}\n'.format(headers=pretty(request_parms['headers']))
    if 'method' in request_parms:
        pretty_request += '\tMethod: {method}\n'.format(method=request_parms['method'])
    if 'data' in request_parms:
        try:
            pretty_request += '\tData: \n{data}\n'.format(data=pretty(request_parms['data']))
        except:
            pretty_request += '\tData: \n{data}\n'.format(data=request_parms['data'])
    return pretty_request

def pretty_response(response):
    """
    Build a string with a pretty format the response
    :param response:
    :return:
    """
    pretty_response = '\n'
    pretty_response += '\tHeaders: {headers}\n'.format(headers=pretty(dict(response.headers)))
    try:
        pretty_response += '\tData: \n{data}\n'.format(data=pretty(response.json()))
    except:
        pretty_response += '\tData: \n{data}\n'.format(data=response.text)
    pretty_response += '\tStatus code: {status_code}\n'.format(status_code=response.status_code)
    return pretty_response


def convert(data):
    """
    Delete all unicode content in structures
    :param data:
    :return:
    """
    if isinstance(data, basestring):
        return str(data)
    elif isinstance(data, collections.Mapping):
        return dict(map(convert, data.iteritems()))
    elif isinstance(data, collections.Iterable):
        return type(data)(map(convert, data))
    else:
        return data


def ordered_elements(obj):
    """
    Order elements inside the iterable objects
    :param obj:
    :return:
    """
    if isinstance(obj, dict):
        return {k: ordered_elements(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return sorted(ordered_elements(x) for x in obj)
    else:
        return obj


def lower_dict_keys(dictionary):
    """
    Lower all keys in a dictionary
    :param dictionary:
    :return:
    """
    return dict((k.lower(), v) for k, v in dictionary.iteritems())


def check_equals(dict1, dict2, keys):
    """
    Check if the given keys are in two dicts and are equals if the key is in the dict1
    :param dict1:
    :param dict2:
    :param keys:
    :return:
    """
    dict1_lower = lower_dict_keys(dict1)
    dict2_lower = lower_dict_keys(dict2)
    for key in keys:
        if key in dict1_lower:
            if key not in dict2_lower:
                raise KeyError(
                    'One of the dicts has not the key "{key}": \n {dict1} \n\n {dict2}'.format(key=key, dict1=dict1_lower,
                                                                                               dict2=dict2_lower))
            assert dict1_lower[key] == dict2_lower[key], 'The key "{key}" is different in: \n{dict1}\n\n{dict2}'.format(
                key=key, dict1=dict1_lower, dict2=dict2_lower)


def urlparseargs_to_nodejsargs(url):
    args_to_parse = urlparse.urlsplit(url).query
    if args_to_parse != '':
        res = {}
        for parm in args_to_parse.split('&'):
            res.update({str(parm.split('=')[0]): [str(parm.split('=')[1])]})
        return res
    else:
        return ''


def equals_objects(object1, object2, msg=''):
    if msg == '':
        msg_not_assert = 'The elements are not equals: \n {object1} \n\n {obejct2}'.format(object1=object1,
                                                                                           object2=object2)
    else:
        msg_not_assert = msg
    if type(object1) is dict:
        object1_lower = lower_dict_keys(object1)
    else:
        object1_lower = object1
    if type(object2) is dict:
        object2_lower = lower_dict_keys(object2)
    else:
        object2_lower = object2
    assert convert(ordered_elements(object1_lower)) == convert(ordered_elements(object2_lower)), msg_not_assert


def show_times(init_value):
    """
    shows the time duration of the entire test
    :param init_value: initial time
    """
    print "**************************************************************"
    print "Initial (date & time): " + str(init_value)
    print "Final   (date & time): " + str(time.strftime("%c"))
    print "**************************************************************"


def start_pep_app():
    """
    Depending of the method defined in properties" start PEP with the config defined
    :return:
    """
    if world.environment == 'docker':
        start_docker_pep(world.docker_ip, world.docker_user, world.docker_password,
                         world.docker_pep_user, world.docker_pep_password,
                         world.docker_pep_container, world.pep_path)
    if world.environment == 'remote':
        start_pep(world.pep_host_ip, world.pep_host_user, world.pep_host_password, pep_path=world.pep_path)
    if world.environment == 'local':
        start_pep_local(world.pep_path)


def start_mock(filename, ip, port):
    """
    Start the mock where the PEP will redirect the petition if pass the authentication
    :param filename:
    :param ip:
    :param port:
    :return:
    """
    path, fl = os.path.split(os.path.realpath(__file__))
    if platform.system() == 'Windows':
        path = path[0:path.rfind('\\')] + '\\tools\\mocks\\'
    elif platform.system() == 'Linux':
        path = path[0:path.rfind('/')] + '/tools/mocks/'
    else:
        raise NameError('The SO is not recognize, start the mock manually')
    # path += '\\mocks\\'
    DEVNULL = open(os.devnull, 'wb')
    command = ('python %s%s %s %s' % (path, filename, ip, port)).split(' ')
    return subprocess.Popen(command, stdout=DEVNULL, stderr=DEVNULL)


def stop_process(process):
    """
    Given a "subprocess" process, kill it and its children process in the correct SO
    :param process:
    :return:
    """
    if platform.system() == 'Windows':
        subprocess.Popen(['taskkill', '/F', '/T', '/PID', str(process.pid)])
    elif platform.system() == 'Linux':
        kill(process.pid)
    else:
        raise NameError('The SO is not recognize, stop the process manually')


def kill(proc_pid):
    """
    Funct to kill all process with his children
    :param proc_pid:
    :return:
    """
    process = psutil.Process(proc_pid)
    for proc in process.get_children(recursive=True):
        proc.kill()
    process.kill()


def start_proxy(ip_proxy, port_proxy, ip_destination, port_destination):
    """
    Start proxys in windows or linux
    :param ip_proxy:
    :param port_proxy:
    :param ip_destination:
    :param port_destination:
    :return:
    """
    path, fl = os.path.split(os.path.realpath(__file__))
    if platform.system() == 'Windows':
        path = path[0:path.rfind('\\')] + '\\tools\\mocks\\'
    elif platform.system() == 'Linux':
        path = path[0:path.rfind('/')] + '/tools/mocks/'
    else:
        raise NameError('The SO is not recognize, start the proxys manually')
    DEVNULL = open(os.devnull, 'wb')
    command = ('python %sproxy.py %s %s %s %s' % (path, ip_proxy, port_proxy, ip_destination, port_destination)).split(
        ' ')
    proxy_proc = subprocess.Popen(command, stdout=DEVNULL, stderr=DEVNULL)
    return proxy_proc


def initialize_keystone(platform, environment):
    """
    Initialize the keystone environment needed to the tests
    :param platform:
    :param environment:
    :return:
    """
    try:
        IdmUtils.prepare_environment(platform, environment)
    except Exception as e:
        for domain in environment['domains']:
            IdmUtils.clean_service(platform, domain['name'])
        IdmUtils.prepare_environment(platform, environment)


def initialize_ac(user_roles, ac_ip, ac_port, structure, domain, project, policy_name):
    """
    Initialize the AccessControl environment needed to the tests
    :param user_roles:
    :param ac_ip:
    :param structure:
    :param domain:
    :param project:
    :param policy_name:
    :return:
    """
    ac = AC(ac_ip, port=ac_port)
    ac.delete_tenant_policies(domain)
    if project == '/':
        for user_role in user_roles:
            customer_role_id = structure[domain]['users'][user_role[0]]['roles'][user_role[1]]['id']
            ac.create_policy(domain, customer_role_id, policy_name + '_' + user_role[1],
                             'fiware:orion:%s:%s::' % (domain, project), user_role[1])
    else:
        for user_role in user_roles:
            customer_role_id = structure[domain]['projects'][project]['users'][user_role[0]]['roles'][user_role[1]]['id']
            ac.create_policy(domain, customer_role_id, policy_name + '_' + user_role[1],
                             'fiware:orion:%s:%s::' % (domain, project), user_role[1])


def start_environment():
    """
    Start all mocks and proxys needed for the tests
    :return:
    """
    # start proxys
    world.ks_proxy = start_proxy(world.ks_proxy_bind_ip, world.ks_proxy_port, world.ks['platform']['address']['ip'],
                                 world.ks['platform']['address']['port'])
    world.ac_proxy = start_proxy(world.ac_proxy_bind_ip, world.ac_proxy_port, world.ac['ip'], world.ac['port'])
    world.mock_dest = start_mock('mock.py', world.mock['ip'], world.mock['port'])


def stop_environment():
    """
    Stop all mocks and proxys used in the tests
    :return:
    """
    stop_process(world.ks_proxy)
    stop_process(world.ac_proxy)
    stop_process(world.mock_dest)
    if world.environment == 'docker':
        stop_docker_pep(world.docker_ip, world.docker_user, world.docker_password,
                        world.docker_pep_user, world.docker_pep_password,
                        world.docker_pep_container)
    if world.environment == 'remote':
        stop_pep(world.pep_host_ip, world.pep_host_user, world.pep_host_password)
    if world.environment == 'local':
        stop_local_pep()


def set_config_cb():
    """
    Set the Context Broker configuration in the config file
    :return:
    """
    set_variables_config(world.mock['ip'], world.mock['port'], world.pep_port, world.ac_proxy_port, world.ac_proxy_ip,
                         world.ks['platform']['pep']['user'], world.ks['platform']['pep']['password'],
                         world.ks['platform']['cloud_domain']['name'], world.ks_proxy_ip, world.ks_proxy_port,
                         'DEBUG', world.cb_plug_in, world.cb_extract_action, administration_port=world.administration_port)


def set_config_access_control():
    """
    Set the Access Control configuration in the config file
    :return:
    """
    set_variables_config(world.mock['ip'], world.mock['port'], world.pep_port, world.ac_proxy_port, world.ac_proxy_ip,
                         world.ks['platform']['pep']['user'], world.ks['platform']['pep']['password'],
                         world.ks['platform']['cloud_domain']['name'], world.ks_proxy_ip, world.ks_proxy_port,
                         'DEBUG', world.keypass_plug_in, world.keypass_extract_action, administration_port=world.administration_port)


def set_config_perseo():
    """
    Set the perseo configuration in the config file
    :return:
    """
    set_variables_config(world.mock['ip'], world.mock['port'], world.pep_port, world.ac_proxy_port, world.ac_proxy_ip,
                         world.ks['platform']['pep']['user'], world.ks['platform']['pep']['password'],
                         world.ks['platform']['cloud_domain']['name'], world.ks_proxy_ip, world.ks_proxy_port,
                         'DEBUG', world.perseo_plug_in, world.perseo_extract_action, administration_port=world.administration_port)


def set_config_bypass():
    """
    Set the bypass configuration in the config file (the general configuration is the Access Control configuration)
    :return:
    """
    set_variables_config(world.mock['ip'], world.mock['port'], world.pep_port, world.ac_proxy_port, world.ac_proxy_ip,
                         world.ks['platform']['pep']['user'], world.ks['platform']['pep']['password'],
                         world.ks['platform']['cloud_domain']['name'], world.ks_proxy_ip, world.ks_proxy_port,
                         'DEBUG', world.keypass_plug_in, world.keypass_extract_action, 'true',
                         world.structure[world.ks['domain_bypass']]['users'][world.ks['user_bypass']]['roles'][
                             world.ac['bypass_role']]['id'], administration_port=world.administration_port)


def set_config_cache_gradual():
    """
    Set the configuration to tests cache when the expiration is different to each cache
    :return:
    """
    set_variables_config(world.mock['ip'], world.mock['port'], world.pep_port, world.ac_proxy_port, world.ac_proxy_ip,
                         world.ks['platform']['pep']['user'], world.ks['platform']['pep']['password'],
                         world.ks['platform']['cloud_domain']['name'], world.ks_proxy_ip, world.ks_proxy_port,
                         'DEBUG', world.cb_plug_in, world.cb_extract_action,
                         cache_users='10', cache_projects='20', cache_roles='30', administration_port=world.administration_port)


def set_config_cache_projects():
    """
    Set the configuration to test cache when the projects expire first
    :return:
    """
    set_variables_config(world.mock['ip'], world.mock['port'], world.pep_port, world.ac_proxy_port, world.ac_proxy_ip,
                         world.ks['platform']['pep']['user'], world.ks['platform']['pep']['password'],
                         world.ks['platform']['cloud_domain']['name'], world.ks_proxy_ip, world.ks_proxy_port,
                         'DEBUG', world.cb_plug_in, world.cb_extract_action,
                         cache_users='30', cache_projects='10', cache_roles='30', administration_port=world.administration_port)


def set_config_cache_roles():
    """
    Set the configuration to test cache when the roles expire first
    :return:
    """
    set_variables_config(world.mock['ip'], world.mock['port'], world.pep_port, world.ac_proxy_port, world.ac_proxy_ip,
                         world.ks['platform']['pep']['user'], world.ks['platform']['pep']['password'],
                         world.ks['platform']['cloud_domain']['name'], world.ks_proxy_ip, world.ks_proxy_port,
                         'DEBUG', world.cb_plug_in, world.cb_extract_action,
                         cache_users='30', cache_projects='30', cache_roles='10', administration_port=world.administration_port)


def set_cb_config_withour_cache():
    """
    Set the configuration to test cache when the roles expire first
    :return:
    """
    set_variables_config(world.mock['ip'], world.mock['port'], world.pep_port, world.ac_proxy_port, world.ac_proxy_ip,
                         world.ks['platform']['pep']['user'], world.ks['platform']['pep']['password'],
                         world.ks['platform']['cloud_domain']['name'], world.ks_proxy_ip, world.ks_proxy_port,
                         'DEBUG', world.cb_plug_in, world.cb_extract_action,
                         cache_users='-1', cache_projects='-1', cache_roles='-1', administration_port=world.administration_port)


def set_cb_config_with_bad_ks_ip():
    """
    Set the configuration to test error connection with the ks
    :return:
    """
    set_variables_config(world.mock['ip'], world.mock['port'], world.pep_port, world.ac_proxy_port, world.ac_proxy_ip,
                         world.ks['platform']['pep']['user'], world.ks['platform']['pep']['password'],
                         world.ks['platform']['cloud_domain']['name'], '1', world.ks_proxy_port,
                         'DEBUG', world.cb_plug_in, world.cb_extract_action,
                         cache_users='-1', cache_projects='-1', cache_roles='-1', administration_port=world.administration_port)


def set_cb_config_with_bad_ac_ip():
    """
    Set the configuration to test error connection with the ac
    :return:
    """
    set_variables_config(world.mock['ip'], world.mock['port'], world.pep_port, world.ac_proxy_port, '1',
                         world.ks['platform']['pep']['user'], world.ks['platform']['pep']['password'],
                         world.ks['platform']['cloud_domain']['name'], world.ks_proxy_ip, world.ks_proxy_port,
                         'DEBUG', world.cb_plug_in, world.cb_extract_action,
                         cache_users='-1', cache_projects='-1', cache_roles='-1', administration_port=world.administration_port)


def set_cb_config_with_bad_target_ip():
    """
    Set the configuration to test error connection with the final target
    :return:
    """
    set_variables_config('1', world.mock['port'], world.pep_port, world.ac_proxy_port, world.ac_proxy_ip,
                         world.ks['platform']['pep']['user'], world.ks['platform']['pep']['password'],
                         world.ks['platform']['cloud_domain']['name'], world.ks_proxy_ip, world.ks_proxy_port,
                         'DEBUG', world.cb_plug_in, world.cb_extract_action,
                         cache_users='-1', cache_projects='-1', cache_roles='-1', administration_port=world.administration_port)


def set_cb_config_with_bad_pep_user():
    """
    Set the configuration to bad pep credentials
    :return:
    """
    set_variables_config('1', world.mock['port'], world.pep_port, world.ac_proxy_port, world.ac_proxy_ip,
                         'bad_pep_user', world.ks['platform']['pep']['password'],
                         world.ks['platform']['cloud_domain']['name'], world.ks_proxy_ip, world.ks_proxy_port,
                         'DEBUG', world.cb_plug_in, world.cb_extract_action,
                         cache_users='-1', cache_projects='-1', cache_roles='-1', administration_port=world.administration_port)

def set_cb_config_with_ac_and_headers_deactivated():
    """
    Set the configuration to bad pep credentials
    :return:
    """
    set_variables_config(world.mock['ip'], world.mock['port'], world.pep_port, world.ac_proxy_port, world.ac_proxy_ip,
                         world.ks['platform']['pep']['user'], world.ks['platform']['pep']['password'],
                         world.ks['platform']['cloud_domain']['name'], world.ks_proxy_ip, world.ks_proxy_port,
                         'DEBUG', world.cb_plug_in, world.cb_extract_action, administration_port=world.administration_port,
                         ac_disable='true', ks_check_headers='false')

def set_cb_config_with_ac():
    """
    Set the configuration to bad pep credentials
    :return:
    """
    set_variables_config(world.mock['ip'], world.mock['port'], world.pep_port, world.ac_proxy_port, world.ac_proxy_ip,
                         world.ks['platform']['pep']['user'], world.ks['platform']['pep']['password'],
                         world.ks['platform']['cloud_domain']['name'], world.ks_proxy_ip, world.ks_proxy_port,
                         'DEBUG', world.cb_plug_in, world.cb_extract_action, administration_port=world.administration_port,
                         ac_disable='true')


def get_package_json():
    """
    Get the package json content in python dict
    :return:
    """
    path, fl = os.path.split(os.path.realpath(__file__))
    if platform.system() == 'Windows':
        separator = '\\'
    elif platform.system() == 'Linux':
        separator = '/'
    else:
        raise ValueError('SO not recognized')
    path_folders = path.split(separator)
    # The file "package.json" is three levels up this file
    path = separator.join(path_folders[:len(path_folders)-3])
    file = open('{path}{separator}package.json'.format(path=path, separator=separator))
    return json.load(file)


def reset_test_variables():
    """
    Reste the world attributes set in the tests
    :return:
    """
    world.data = ''
    world.url = ''
    world.action_type = ''
    world.headers = {}
    world.method = ''
    world.domain = ''
    world.project = ''
    world.user = ''
    world.history = ''
    world.last_petition_added = ''
    world.response = ''
    world.new_petition = ''
    world.format = ''
    world.request_parms = {}
