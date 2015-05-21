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

__author__ = 'Jon Calderin Goñi <jon.caldering@gmail.com>'

from fabric.api import run, env, cd, put, sudo, local, output
import os
import platform
from lettuce import world


def set_variables_config(host_proxied_ip, host_proxied_port, port_listening,
                         ac_port, ac_ip,
                         pep_user, pep_password, pep_domain,
                         ks_ip, ks_port,
                         log_level,
                         plug_in, plug_in_extract_action,
                         bypass_activation='false', bypass_id='',
                         cache_users='1000', cache_projects='1000', cache_roles='60', administration_port='11211', ac_disable='false', ks_check_headers='true'):
    """
    Modify the variables in the PEP config_template file and write the final values in a PEP config file.
    :param host_proxied_ip:
    :param host_proxied_port:
    :param port_listening:
    :param ac_port:
    :param ac_ip:
    :param pep_user:
    :param pep_password:
    :param pep_domain:
    :param ks_ip:
    :param ks_port:
    :param log_level:
    :param plug_in:
    :param plug_in_extract_action:
    :param bypass_activation:
    :param bypass_id:
    :param cache_users:
    :param cache_projects:
    :param cache_roles:
    :param administration_port:
    :return:
    """
    world.log.info('Setting the pep config')
    replaces = {
        'host_proxied_ip': host_proxied_ip,
        'host_proxied_port': host_proxied_port,
        'port_listening': port_listening,
        'ac_ip': ac_ip,
        'ac_port': ac_port,
        'ac_disable': ac_disable,
        'pep_user': pep_user,
        'pep_password': pep_password,
        'pep_domain': pep_domain,
        'ks_check_headers': ks_check_headers,
        'ks_ip': ks_ip,
        'ks_port': ks_port,
        'log_level': log_level,
        'plug_in': plug_in,
        'plug_in_extract_action': plug_in_extract_action,
        'bypass_activation': bypass_activation,
        'bypass_id': bypass_id,
        'cache_users': cache_users,
        'cache_projects': cache_projects,
        'cache_roles': cache_roles,
        'administration_port': administration_port
    }
    path, fl = os.path.split(os.path.realpath(__file__))
    if platform.system() == 'Windows':
        path += '\\resources\\'
    elif platform.system() == 'Linux':
        path += '/resources/'
    else:
        raise NameError('The SO is not recognize, set the config manually')
    full_path_template = path + 'config_template.js'
    full_path_config = path + 'config.js'
    template = open(full_path_template)
    config = open(full_path_config, 'w+')
    # Check in each line if there is a variable to modify
    for line in template.readlines():
        for replace in replaces:
            string_to_replace = '{{%s}}' % replace
            if line.find(string_to_replace) >= 0:
                line = line.replace(string_to_replace, replaces[replace])
        config.write(line)
    template.close()
    config.close()


def get_ssh_port(container_name):
    """
    Given the name of a container, get the ssh port
    :param container_name:
    :return:
    """
    world.log.info('Getting ssh port of the container')
    ret = run('docker port {container_name} 22'.format(container_name=container_name))
    return ret.split(':')[1]


def start_docker_pep(ip_host, user_host, password_host, container_user, container_pass, container_name,
                     pep_path='/fiware-pep-steelskin'):
    """
    Given the docker host, get the PEP container and start it with the config defined
    :param ip_host:
    :param user_host:
    :param password_host:
    :param container_user:
    :param container_pass:
    :param container_name:
    :param pep_path:
    :return:
    """
    world.log.info('Starting pep in docker')
    env.host_string = ip_host
    env.user = user_host
    env.password = password_host
    output['stdout'] = False
    output['running'] = False
    output['warnings'] = False
    container_port = get_ssh_port(container_name)
    start_pep(ip_host, container_user, container_pass, container_port, pep_path)


def stop_docker_pep(ip_host, user_host, password_host, container_user, container_pass, container_name):
    """
    Given the docker host, get the PEP container and stop it
    :param ip_host:
    :param user_host:
    :param password_host:
    :param container_user:
    :param container_pass:
    :param container_name:
    :return:
    """
    world.log.info('Stoping pep in docker')
    env.host_string = ip_host
    env.user = user_host
    env.password = password_host
    output['stdout'] = False
    output['running'] = False
    output['warnings'] = False
    container_port = get_ssh_port(container_name)
    stop_pep(ip_host, container_user, container_pass, container_port)


def start_pep(ip, user, password, port='22', pep_path='/fiware-pep-steelskin'):
    """
    Given a ssh connection data, stop PEP if its running, put the new configuration, and start is.
    The machina have to has the "dtach" package
    :param ip:
    :param user:
    :param password:
    :param port:
    :param pep_path:
    :return:
    """
    world.log.info('Starting pep in remote')
    env.host_string = ip + ':' + port
    env.user = user
    env.password = password
    env.sudo_password = password
    output['stdout'] = False
    output['running'] = False
    output['warnings'] = False
    path, fl = os.path.split(os.path.realpath(__file__))
    if platform.system() == 'Windows':
        config = path + '\\resources\\' + 'config.js'
    elif platform.system() == 'Linux':
        config = path + '/resources/' + 'config.js'
    else:
        raise NameError('The SO is not supported')
    so = run('cat /etc/issue').split('\n')[0].split(' ')[0]
    if so == 'CentOS':
        pid = sudo('ps -ef | grep "node bin/pepProxy" | grep -v grep | awk \'{print $2}\'')
    elif so == 'Ubuntu':
        pid = sudo('ps -ef | grep "nodejs bin/pepProxy" | grep -v grep | awk \'{print $2}\'')
    else:
        raise NameError('Pep only can be started in Ubuntu and CentOS systems')
    if pid != '':
        for proc_pid in pid.split('\n'):
            sudo('kill -9 {pid}'.format(pid=proc_pid.strip()))
    with cd(pep_path):
        put(config, '{path}/config.js'.format(path=pep_path))
        sudo('mkdir -p {pep_tmp_dir}'.format(pep_tmp_dir=world.pep_tmp_dir))
        if so == 'CentOS':
            resp = sudo('dtach -n `mktemp -u {pep_tmp_dir}/dtach.XXXX` /bin/bash -c \' node bin/pepProxy >> {pep_tmp_dir}/pep.log\''.format(pep_tmp_dir=world.pep_tmp_dir))
        elif so == 'Ubuntu':
            resp =sudo('dtach -n `mktemp -u {pep_tmp_dir}/dtach.XXXX` /bin/bash -c \' nodejs bin/pepProxy >> {pep_tmp_dir}/pep.log\''.format(pep_tmp_dir=world.pep_tmp_dir))
        else:
            raise NameError('Pep only can be started in Ubuntu and CentOS systems')
        world.log.debug('The response initializing pep in remote is: {resp}'.format(resp=resp))



def stop_pep(ip, user, password, port='22'):
    """
    Stop pep process
    :param ip:
    :param user:
    :param password:
    :param port:
    :return:
    """
    world.log.info('Stoping pep in remote')
    env.host_string = ip + ':' + port
    env.user = user
    env.password = password
    env.sudo_password = password
    output['stdout'] = False
    output['running'] = False
    output['warnings'] = False
    so = run('cat /etc/issue').split('\n')[0].split(' ')[0]
    if so == 'CentOS':
        pid = sudo('ps -ef | grep "node bin/pepProxy" | grep -v grep | awk \'{print $2}\'')
    elif so == 'Ubuntu':
        pid = sudo('ps -ef | grep "nodejs bin/pepProxy" | grep -v grep | awk \'{print $2}\'')
    else:
        raise NameError('Pep only can be started in Ubuntu and CentOS systems')
    if pid != '':
        for proc_pid in pid.split('\n'):
            sudo('kill -9 {pid}'.format(pid=proc_pid.strip()))


def start_pep_local(pep_path='/fiware-pep-steelskin'):
    """
    Given a ssh connection data, stop PEP if its running, put the new configuration, and start is.
    The machine has to have the "dtach" package
    :param pep_path:
    :return:
    """
    world.log.info('Starting pep in local')
    output['stdout'] = False
    output['running'] = False
    output['warnings'] = False
    path, fl = os.path.split(os.path.realpath(__file__))
    if platform.system() == 'Windows':
        config = path + '\\resources\\' + 'config.js'
    elif platform.system() == 'Linux':
        config = path + '/resources/' + 'config.js'
    else:
        raise NameError('The SO is not supported')
    so = local('cat /etc/issue', capture=True).split('\n')[0].split(' ')[0]
    if so == 'CentOS':
        pid = local('ps -ef | grep "node bin/pepProxy" | grep -v grep | awk \'{print $2}\'', capture=True)
    elif so == 'Ubuntu':
        pid = local('ps -ef | grep "nodejs bin/pepProxy" | grep -v grep | awk \'{print $2}\'', capture=True)
    else:
        raise NameError('Pep only can be started in Ubuntu and CentOS systems')
    if pid != '':
        for proc_pid in pid.split('\n'):
            local('kill -9 {pid}'.format(pid=proc_pid.strip()), capture=True)
    local('cp {config} {path}/config.js'.format(config=config, path=pep_path), capture=True)
    local('mkdir -p {pep_tmp_dir}'.format(pep_tmp_dir=world.pep_tmp_dir))
    if so == 'CentOS':
        resp = local('dtach -n `mktemp -u {pep_tmp_dir}/dtach.XXXX` /bin/bash -c \' cd {path} && node bin/pepProxy >> {pep_tmp_dir}/pep.log\''.format(path=pep_path, pep_tmp_dir=world.pep_tmp_dir), capture=True)
    elif so == 'Ubuntu':
        resp = local('dtach -n `mktemp -u {pep_tmp_dir}/dtach.XXXX` /bin/bash -c \' cd {path} && nodejs bin/pepProxy >> {pep_tmp_dir}/pep.log\''.format(path=pep_path, pep_tmp_dir=world.pep_tmp_dir), capture=True)
    else:
        raise NameError('Pep only can be started in Ubuntu and CentOS systems')
    world.log.debug('The response initializing pep in local is: {resp}'.format(resp=resp))


def stop_local_pep():
    """
    Stop pep process
    :return:
    """
    world.log.info('Stoping pep in local')
    output['stdout'] = False
    output['running'] = False
    output['warnings'] = False
    so = local('cat /etc/issue', capture=True).split('\n')[0].split(' ')[0]
    if so == 'CentOS':
        pid = local('ps -ef | grep "node bin/pepProxy" | grep -v grep | awk \'{print $2}\'', capture=True)
    elif so == 'Ubuntu':
        pid = local('ps -ef | grep "nodejs bin/pepProxy" | grep -v grep | awk \'{print $2}\'', capture=True)
    else:
        raise NameError('Pep only can be started in Ubuntu and CentOS systems')
    if pid != '':
        for proc_pid in pid.split('\n'):
            local('kill -9 {pid}'.format(pid=proc_pid.strip()), capture=True)

