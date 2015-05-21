# -*- coding: utf-8 -*-
"""
Copyright 2015 Telefonica Investigación y Desarrollo, S.A.U

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

from lettuce import step, world
from tools.general_utils import get_package_json


@step('the PEP returns an error with code "([^"]*)" and name "([^"]*)"')
def the_pep_returns_an_error_with_code_and_name(step, error_code, error_name):
    """
    Check if PEP returns the given error with the given name
    :param step:
    :param error_code:
    :param error_name:
    :return:
    """
    assert str(
        world.response.status_code) == error_code and world.response.json()['name'] == error_name, 'PEP do not return \
        the error expected ({error_code_expected}), returned: {error_returned} \
        or error name expected {error_name_expected}, returned: {error_name_returned}'\
        .format(error_returned=str(world.response.status_code), error_code_expected=error_code,
                error_name_expected=error_name, error_name_returned=world.response.json()['name'])


@step('pep return the same version that are in package.json file')
def pep_return_the_same_version_that_are_in_package_json_file(step):
    """
    Check if the PEP version returned is the same of the PEP version in the file package.json
    :param step:
    :return:
    """
    package_json_version = get_package_json()['version']
    version_returned = world.response.json()['version']
    assert package_json_version == version_returned, 'The version indicated in the file is "{package_json_version}" and\
     the version returned from pep is "{version_returned}"'.format(
        package_json_version=package_json_version, version_returned=version_returned)


@step('the PEP returns an ok')
def the_pep_returns_an_ok(step):
    """
    Check if PEP returns ok http code (200)
    :param step:
    :return:
    """
    assert world.response.status_code == 200, 'The PEP not return the ok response code'
