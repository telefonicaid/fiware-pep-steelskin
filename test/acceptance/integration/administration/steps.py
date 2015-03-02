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
If not, see http://www.gnu.org/licenses/.

For those usages not covered by the GNU Affero General Public License
please contact with::[iot_support@tid.es]
"""

__author__ = 'Jon Calderin Goñi <jon.caldering@gmail.com>'

from lettuce import step, world
import requests
from tools.general_utils import get_package_json


@step('the url and path of pep version')
def the_url_and_path_of_pep_version(step):
    world.url = 'http://{pep_ip}:{pep_port}'.format(pep_ip=world.pep_host_ip,
                                                    pep_port=world.administration_port) + '/version'


@step('the request is asked')
def the_request_is_asked(step):
    world.response = requests.request('get', world.url)


@step('pep return the same version that are in package.json file')
def pep_return_the_same_version_that_are_in_package_json_file(step):
    package_json_version = get_package_json()['version']
    version_returned = world.response.json()['version']
    assert package_json_version == version_returned, 'The version indicated in the file is "{package_json_version}" and\
     the version returned from pep is "{version_returned}"'.format(
        package_json_version=package_json_version, version_returned=version_returned)

