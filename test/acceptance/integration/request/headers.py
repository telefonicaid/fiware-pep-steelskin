from lettuce import step, world

from iotqautils.idm_keystone import IdmUtils, RequestUtils
from iotqautils.pep_utils import Pep

import requests


#
# @step("PEP gets a request with the headers")
# def step_impl(step):
#     """
#     :type step lettuce.core.Step
#     """
#     pass
#
#
# @step("PEP ask to KEYSTONE for the information")
# def step_impl(step):
#     """
#     :type step lettuce.core.Step
#     """
#     pass
#
# @step('the token "([^"]*)"')
# def given_the_token(step, token):
#     world.user_token = token
#
# @step('the subservice "([^"]*)"')
# def and_the_subservice(step, subservice):
#     world.subservice = subservice
#
# @step('the service "([^"]*)"')
# def and_the_service(step, service):
#     world.service = service
#
# @step('request is made to PEP')
# def when_request_is_made_to_pep(step):
#     headers = {
#         "Accept": "application/json",
#         'content-type': 'application/json',
#         'Fiware-Servicepath': '/' + str(world.subservice),
#         'X-Auth-Token': world.user_token,
#         'Fiware-Service': world.service
#     }
#     print requests.get('http://127.0.0.1:1025/v1/contextEntities', headers=headers).text
#
# @step('PEP sends the information to keystone')
# def then_pep_sends_the_information_to_keystone(step):
#     print world.pep_request_to_keystone
#
