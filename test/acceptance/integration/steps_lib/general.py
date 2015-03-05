# -*- coding: utf-8 -*-
"""
Copyright 2015 Telefonica Investigación y Desarrollo, S.A.U

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
import time

__author__ = 'Jon Calderin Goñi <jon.caldering@gmail.com>'

from lettuce import world, step


@step('waits "([^"]*)" seconds to "([^"]*)" cache expire')
def waits_group1_seconds_to_group2_cache_expire(step, time_to_sleep, cache_group):
    """
    Store the new petition will be raised depending of which cache is expired (empty by default)
    :param step:
    :param time_to_sleep:
    :param cache_group:
    :return:
    """
    time.sleep(int(time_to_sleep) + 1)
    if cache_group == 'users':
        world.new_petition = 'v3/auth/tokens'
    if cache_group == 'projects':
        world.new_petition = 'v3/projects'
    if cache_group == 'roles':
        world.new_petition = 'v3/role_assignments'