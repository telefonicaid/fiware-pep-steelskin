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

__author__ = 'Jon'

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
    command = ('python %sproxy.py %s %s %s %s' % (path, ip_proxy, port_proxy, ip_destination, port_destination)).split(' ')
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
        for user_rol in user_roles:
            customer_role_id = structure[domain]['users'][user_rol[0]]['roles'][user_rol[1]]['id']
            ac.create_policy(domain, customer_role_id, policy_name + '_' + user_rol[1],
                             'fiware:orion:%s:%s::' % (domain, project), user_rol[1])
    else:
        for user_rol in user_roles:
            customer_role_id = structure[domain]['projects'][project]['users'][user_rol[0]]['roles'][user_rol[1]]['id']
            ac.create_policy(domain, customer_role_id, policy_name + '_' + user_rol[1],
                             'fiware:orion:%s:%s::' % (domain, project), user_rol[1])


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
                         'DEBUG', world.cb_plug_in, world.cb_extract_action)


def set_config_keypass():
    """
    Set the Keypass configuration in the config file
    :return:
    """
    set_variables_config(world.mock['ip'], world.mock['port'], world.pep_port, world.ac_proxy_port, world.ac_proxy_ip,
                         world.ks['platform']['pep']['user'], world.ks['platform']['pep']['password'],
                         world.ks['platform']['cloud_domain']['name'], world.ks_proxy_ip, world.ks_proxy_port,
                         'DEBUG', world.keypass_plug_in, world.keypass_extract_action)


def set_config_perseo():
    """
    Set the perseo configuration in the config file
    :return:
    """
    set_variables_config(world.mock['ip'], world.mock['port'], world.pep_port, world.ac_proxy_port, world.ac_proxy_ip,
                         world.ks['platform']['pep']['user'], world.ks['platform']['pep']['password'],
                         world.ks['platform']['cloud_domain']['name'], world.ks_proxy_ip, world.ks_proxy_port,
                         'DEBUG', world.perseo_plug_in, world.perseo_extract_action)


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
                             world.ac['bypass_rol']]['id'])


def set_config_cache_gradual():
    """
    Set the configuration to tests cache when the expiration is different to each cache
    :return:
    """
    set_variables_config(world.mock['ip'], world.mock['port'], world.pep_port, world.ac_proxy_port, world.ac_proxy_ip,
                         world.ks['platform']['pep']['user'], world.ks['platform']['pep']['password'],
                         world.ks['platform']['cloud_domain']['name'], world.ks_proxy_ip, world.ks_proxy_port,
                         'DEBUG', world.cb_plug_in, world.cb_extract_action,
                         cache_users='10', cache_projects='20', cache_roles='30')


def set_config_cache_projects():
    """
    Set the configuration to test cache when the projects expire first
    :return:
    """
    set_variables_config(world.mock['ip'], world.mock['port'], world.pep_port, world.ac_proxy_port, world.ac_proxy_ip,
                         world.ks['platform']['pep']['user'], world.ks['platform']['pep']['password'],
                         world.ks['platform']['cloud_domain']['name'], world.ks_proxy_ip, world.ks_proxy_port,
                         'DEBUG', world.cb_plug_in, world.cb_extract_action,
                         cache_users='30', cache_projects='10', cache_roles='30')


def set_config_cache_roles():
    """
    Set the configuration to test cache when the roles expire first
    :return:
    """
    set_variables_config(world.mock['ip'], world.mock['port'], world.pep_port, world.ac_proxy_port, world.ac_proxy_ip,
                         world.ks['platform']['pep']['user'], world.ks['platform']['pep']['password'],
                         world.ks['platform']['cloud_domain']['name'], world.ks_proxy_ip, world.ks_proxy_port,
                         'DEBUG', world.cb_plug_in, world.cb_extract_action,
                         cache_users='30', cache_projects='30', cache_roles='10')