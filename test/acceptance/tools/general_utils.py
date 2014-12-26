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

import time
import subprocess
import os
import collections


def showTimes (initValue):
    """
    shows the time duration of the entire test
    :param initValue: initial time
    """
    print "**************************************************************"
    print "Initial (date & time): " + str(initValue)
    print "Final   (date & time): " + str(time.strftime("%c"))
    print "**************************************************************"


def start_mock(filename, ip, port):
    path, fl = os.path.split(os.path.realpath(__file__))
    path = path[0:path.rfind('\\')] + '\\tools\\mocks\\'
    #path += '\\mocks\\'
    DEVNULL = open(os.devnull, 'wb')
    mock_proc = subprocess.Popen('python %s%s %s %s' % (path, filename, ip, port), stdout=DEVNULL, stderr=DEVNULL)
    return mock_proc

def stop_mock(pid):
    subprocess.Popen(['taskkill', '/F', '/T', '/PID', str(pid)])


def start_mock_destinations():
    return start_mock('mock.py', '192.168.56.1', '1026')


def convert(data):
    if isinstance(data, basestring):
        return str(data)
    elif isinstance(data, collections.Mapping):
        return dict(map(convert, data.iteritems()))
    elif isinstance(data, collections.Iterable):
        return type(data)(map(convert, data))
    else:
        return data
