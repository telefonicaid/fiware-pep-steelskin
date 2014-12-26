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

import requests
import json

from iotqautils.idm_keystone import IdmUtils

from integration.commons import *


@step('a bypass domain in KEYSTONE')
def a_bypass_domain_in_keystone(step):
    world.domain = world.ks['bypass_domain']


@step('a "([^"]*)" rol in the domain$')
def a_rol_in_the_domain(step, role):
    world.project = '/'

@step('a user bypass in the domain')
def a_user_bypass_in_the_domain(step):
    world.user = world.ks['bypass_user']


@step('a "([^"]*)" rol in the project "([^"]*)"')
def a_group1_rol_in_the_project_group2(step, wole, project):
    world.project = world.ks[project]