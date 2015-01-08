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
from iotqautils.accessControl import AC
from iotqautils.idm_keystone import IdmUtils
from lettuce import world
from deploy_pep import *

__author__ = 'Jon'

import time
import subprocess
import os
import collections


def showTimes (initValue):
    """
    shows the time duration of the entire test
    :param initValue: initial time
    """
    print "**************************************************************"
    print "Initial (date & time): " + str(initValue)
    print "Final   (date & time): " + str(time.strftime("%c"))
    print "**************************************************************"


def start_mock(filename, ip, port):
    path, fl = os.path.split(os.path.realpath(__file__))
    path = path[0:path.rfind('\\')] + '\\tools\\mocks\\'
    #path += '\\mocks\\'
    DEVNULL = open(os.devnull, 'wb')
    mock_proc = subprocess.Popen('python %s%s %s %s' % (path, filename, ip, port), stdout=DEVNULL, stderr=DEVNULL)
    return mock_proc


def stop_process(process):
    subprocess.Popen(['taskkill', '/F', '/T', '/PID', str(process.pid)])

#TODO: It must work in any SO
def start_proxy(ip_proxy, port_proxy, ip_destination, port_destination):
    path, fl = os.path.split(os.path.realpath(__file__))
    path = path[0:path.rfind('\\')] + '\\tools\\mocks\\'
    #path += '\\mocks\\'
    DEVNULL = open(os.devnull, 'wb')
    proxy_proc = subprocess.Popen('python %sproxy.py %s %s %s %s' % (path, ip_proxy, port_proxy, ip_destination, port_destination), stdout=DEVNULL, stderr=DEVNULL)
    return proxy_proc

#TODO: It must work in any SO
def start_mock_destinations(ip, port):
    return start_mock('mock.py', ip, port)


def initialize_keystone(platform, environment):
    try:
        IdmUtils.prepare_environment(platform, environment)
    except:
        for domain in environment['domains']:
            IdmUtils.clean_service(platform, domain['name'])
        IdmUtils.prepare_environment(platform, environment)


def initialize_ac(user_roles, ac_ip, structure, domain, project, policy_name):
    ac = AC(ac_ip)
    ac.delete_tenant_policies(domain)
    if project == '/':
        for user_rol in user_roles:
            customer_role_id = structure[domain]['users'][user_rol[0]]['roles'][user_rol[1]]['id']
            ac.create_policy(domain, customer_role_id, policy_name + '_' + user_rol[1], 'fiware:orion:%s:%s::' % (domain, project), user_rol[1])
    else:
        for user_rol in user_roles:
            customer_role_id = structure[domain]['projects'][project]['users'][user_rol[0]]['roles'][user_rol[1]]['id']
            ac.create_policy(domain, customer_role_id, policy_name + '_' + user_rol[1], 'fiware:orion:%s:%s::' % (domain, project), user_rol[1])


def convert(data):
    if isinstance(data, basestring):
        return str(data)
    elif isinstance(data, collections.Mapping):
        return dict(map(convert, data.iteritems()))
    elif isinstance(data, collections.Iterable):
        return type(data)(map(convert, data))
    else:
        return data


def start_environment():
    # start proxys
    world.ks_proxy = start_proxy(world.ks_proxy_bind_ip, world.ks_proxy_port, world.ks['platform']['address']['ip'], world.ks['platform']['address']['port'])
    world.ac_proxy = start_proxy(world.ac_proxy_bind_ip, world.ac_proxy_port, world.ac['ip'], world.ac['port'])
    world.mock_dest = start_mock_destinations(world.mock['ip'], world.mock['port'])


def stop_environment():
    stop_process(world.ks_proxy)
    stop_process(world.ac_proxy)
    stop_process(world.mock_dest)


def set_config_cb():
    set_variables_config(world.mock['ip'], world.mock['port'], world.pep_port, world.ac_proxy_port, world.ac_proxy_ip,
                         world.pep_user, world.pep_password, world.pep_domain, world.ks_proxy_ip, world.ks_proxy_port,
                         'DEBUG', world.cb_plug_in, world.cb_extract_action)

def set_config_keypass():
    set_variables_config(world.mock['ip'], world.mock['port'], world.pep_port, world.ac_proxy_port, world.ac_proxy_ip,
                         world.pep_user, world.pep_password, world.pep_domain, world.ks_proxy_ip, world.ks_proxy_port,
                         'DEBUG', world.keypass_plug_in, world.keypass_extract_action)

def set_config_perseo():
    set_variables_config(world.mock['ip'], world.mock['port'], world.pep_port, world.ac_proxy_port, world.ac_proxy_ip,
                         world.pep_user, world.pep_password, world.pep_domain, world.ks_proxy_ip, world.ks_proxy_port,
                         'DEBUG', world.perseo_plug_in, world.perseo_extract_action)

def set_config_bypass():
    set_variables_config(world.mock['ip'], world.mock['port'], world.pep_port, world.ac_proxy_port, world.ac_proxy_ip,
                         world.pep_user, world.pep_password, world.pep_domain, world.ks_proxy_ip, world.ks_proxy_port,
                         'DEBUG', world.keypass_plug_in, world.keypass_extract_action, 'true', world.structure[world.ks['domain_bypass']]['users'][world.ks['user_bypass']]['roles'][world.ac['bypass_rol']]['id'])

def set_config_cache_gradual():
    set_variables_config(world.mock['ip'], world.mock['port'], world.pep_port, world.ac_proxy_port, world.ac_proxy_ip,
                         world.pep_user, world.pep_password, world.pep_domain, world.ks_proxy_ip, world.ks_proxy_port,
                         'DEBUG', world.cb_plug_in, world.cb_extract_action, cache_users='10', cache_projects='20', cache_roles='30')

def set_config_cache_projects():
    set_variables_config(world.mock['ip'], world.mock['port'], world.pep_port, world.ac_proxy_port, world.ac_proxy_ip,
                         world.pep_user, world.pep_password, world.pep_domain, world.ks_proxy_ip, world.ks_proxy_port,
                         'DEBUG', world.cb_plug_in, world.cb_extract_action, cache_users='30', cache_projects='10', cache_roles='30')
def set_config_cache_roles():
    set_variables_config(world.mock['ip'], world.mock['port'], world.pep_port, world.ac_proxy_port, world.ac_proxy_ip,
                         world.pep_user, world.pep_password, world.pep_domain, world.ks_proxy_ip, world.ks_proxy_port,
                         'DEBUG', world.cb_plug_in, world.cb_extract_action, cache_users='30', cache_projects='30', cache_roles='10')