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

__author__ = 'Jon Calderin Goñi <jon.caldering@gmail.com>'

from lettuce import step, world

# Refactor *************************************
@step('set the request URL with the path "([^"]*)"')
def build_a_pep_url_with_the_path(step, path):
    """
    Set the url of pep with the path given
    :param step:
    :param path:
    :return:
    """
    world.url = 'http://{pep_ip}:{pep_port}{path}'.format(pep_ip=world.pep_host_ip, pep_port=world.pep_port, path=path)


@step('build a PEP administration url with the path "([^"]*)"')
def build_a_pep_administration_url_with_the_path(step, path):
    """
    Set the url of pep administration with the path given
    :param step:
    :param path:
    :return:
    """
    world.url = 'http://{pep_ip}:{pep_administration_port}'.format(pep_ip=world.pep_host_ip,
                                                                   pep_administration_port=world.administration_port) + '/version'
# *******************