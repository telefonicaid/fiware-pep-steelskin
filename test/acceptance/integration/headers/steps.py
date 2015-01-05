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

@step('headers with format "([^"]*)"$')
def with_format_group1(step, format):
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


@step('the petition action "([^"]*)" is asked$')
def the_petition_is_asked(step, action):
    world.response = requests.request(action.lower(), 'http://{pep_ip}:{pep_port}/'.format(pep_ip=world.pep_ip, pep_port=world.pep_port) + world.url, headers=world.headers, data=world.data)


@step('the petition action "([^"]*)" is asked without data')
def the_petition_is_asked(step, action):
    world.response = requests.request(action.lower(), 'http://{pep_ip}:{pep_port}/'.format(pep_ip=world.pep_ip, pep_port=world.pep_port) + world.url, headers=world.headers, data={})

@step('the Keystone proxy receive the last petition "([^"]*)" from PEP')
def the_keystone_proxy_doesnt_receive_any_petition(step, last_petition):
    resp = requests.request('GET', 'http://192.168.1.37:5001/last_path').text
    print 'last_petition: {last_petition}'.format(last_petition=last_petition)
    print 'last_petition_received: {last_petition}'.format(last_petition=resp)
    assert resp == last_petition

@step('the PEP returns an error')
def the_pep_returns_an_error(step):
    assert str(world.response.status_code) == '403'


