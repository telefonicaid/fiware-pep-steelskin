from lettuce import step, world

from iotqautils.idm_keystone import IdmUtils, RequestUtils
from iotqautils.pep_utils import Pep

import requests
import json

@step('headers without the header "([^"]*)"')
def headers_without_the_header_group1(step, header):
    del world.headers[header]

@step('header "([^"]*)" inexistent in KEYSTONE')
def headers_without_the_header_group1(step, header):
    world.headers[header] = 'inexistant'


@step('headers with format "([^"]*)" and "([^"]*)" action')
def with_format_group1(step, format, action):
    token = IdmUtils.get_token(world.ks['user_all'], world.ks['user_all'], world.ks['domain_ok'], world.ks['platform']['address']['ip'])
    world.format = format
    headers = {
        "Accept": "application/%s" % world.format,
        'content-type': 'application/%s' % world.format,
        'Fiware-Servicepath': '/',
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


@step('the petition action "([^"]*)" is asked$')
def the_petition_is_asked(step, action):
    world.response = requests.request(action.lower(), 'http://{pep_ip}:{pep_port}/'.format(pep_ip=world.pep_host_ip, pep_port=world.pep_port) + world.url, headers=world.headers, data=world.data)



