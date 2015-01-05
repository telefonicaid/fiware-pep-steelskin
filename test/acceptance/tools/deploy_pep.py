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
__author__ = 'Jon'

from fabric.api import run, env, cd, put
import os

def set_variables_config(host_proxied_ip, host_proxied_port, port_listening,
                  ac_port, ac_ip,
                  pep_user, pep_password, pep_domain,
                  ks_ip, ks_port,
                  log_level,
                  plug_in, plug_in_extract_action,
                  bypass_activation='false', bypass_id=''):
    replaces = {
        'host_proxied_ip': host_proxied_ip,
        'host_proxied_port': host_proxied_port,
        'port_listening': port_listening,
        'ac_ip': ac_ip,
        'ac_port': ac_port,
        'pep_user': pep_user,
        'pep_password': pep_password,
        'pep_domain': pep_domain,
        'ks_ip': ks_ip,
        'ks_port': ks_port,
        'log_level': log_level,
        'plug_in': plug_in,
        'plug_in_extract_action': plug_in_extract_action,
        'bypass_activation': bypass_activation,
        'bypass_id': bypass_id
    }
    path, fl = os.path.split(os.path.realpath(__file__))
    path = path + '\\resources\\'
    full_path_template = path + 'config_template.js'
    full_path_config = path + 'config.js'
    template = open(full_path_template)
    config = open(full_path_config, 'w+')
    for line in template.readlines():
        for replace in replaces:
            string_to_replace = '{{%s}}' % replace
            if line.find(string_to_replace) >= 0:
                line = line.replace(string_to_replace, replaces[replace])
        config.write(line)
    template.close()
    config.close()

def get_docker_ac_ip():
    return run('ip.sh ac_c')

def get_docker_ks_ip():
    return run('docker inspect --format \'{{ .NetworkSettings.IPAddress }}\' ks_c')

def get_ssh_port(container_name):
    ret = run('docker port {container_name} 22'.format(container_name=container_name))
    return ret.split(':')[1]

def start_docker_pep(ip_host, user_host, password_host, container_user, container_pass, container_name):
    env.host_string = ip_host
    env.user = user_host
    env.password = password_host
    container_port = get_ssh_port(container_name)
    start_pep(ip_host, container_user, container_pass, container_port)

def start_pep(ip, user, password, port='22'):
    env.host_string = ip + ':' + port
    env.user = user
    env.password = password
    path, fl = os.path.split(os.path.realpath(__file__))
    config = path + '\\resources\\' + 'config.js'
    pid = run('ps -ef | grep "node bin/pepProxy" | grep -v grep | awk \'{print $2}\'')
    if pid != '':
        run('kill -9 {pid}'.format(pid=pid))
    with cd('/fiware-orion-pep'):
        put(config, '/fiware-orion-pep/config.js')
        run('dtach -n `mktemp -u /tmp/dtach.XXXX` /bin/bash -c \'bin/pepProxy >> /tmp/pep.log\'')




if __name__ == '__main__':
    #set_variables('192.168.56.1', '1027', '1026', '5001', '192.168.56.1', 'pep', 'pep', '192.168.56.1', '8082', 'DEBUG', 'orionPlugin', 'extractCBAction')
    print start_pep()