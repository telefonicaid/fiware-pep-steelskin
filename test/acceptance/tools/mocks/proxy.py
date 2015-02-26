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
If not, seehttp://www.gnu.org/licenses/.

For those usages not covered by the GNU Affero General Public License
please contact with::[iot_support@tid.es]
"""
__author__ = 'Jon Calderin Goñi <jon.caldering@gmail.com>'

from flask import Flask, request, Response
import requests
import sys
import collections
from iotqautils.iotqaLogger import get_logger

app = Flask(__name__)


log = get_logger('proxy')

requested = ''
last_path = ''
history = []

def convert(data):
    if isinstance(data, basestring):
        return str(data)
    elif isinstance(data, collections.Mapping):
        return dict(map(convert, data.iteritems()))
    elif isinstance(data, collections.Iterable):
        return type(data)(map(convert, data))
    else:
        return data


@app.route('/', defaults={'path': ''}, methods=['GET', 'POST', 'UPDATE', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'])
@app.route('/<path:path>', methods=['GET', 'POST', 'UPDATE', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'])
def proxy(path):
    global requested
    global last_path
    global history
    log.debug('********************************* Entring in proxy***********************************************************')
    if path == 'last_path':
        ret_last_path = last_path
        last_path = ''
        return ret_last_path
    elif path == 'history':
        return str(history)
    elif path == 'reset_history':
        history = []
        return ''
    else:
        history.append(path)
        last_path = path
        url = request.scheme + '://%s:%s/%s' % (sys.argv[3], sys.argv[4], path)
        headers = convert(dict(request.headers))
        headers['Host'] = "{ip_dest}:{port_dest}".format(ip_dest=sys.argv[3], port_dest=sys.argv[4])
        del headers['Content-Length']
        method = request.method.lower()
        redirect = False
        params = request.args
        stream = False
        timeout = 30
        log.debug('Request: \n\n Method: %s \n\n Headers: %s \n\n Data: %s \n\n URL: %s \n\n ARGS: %s \n\n---------------------------------------------' % \
        (str(method), str(headers), str(request.data), str(url), str(params)))
        if method == 'post':
            log.debug('Sending %s headers' % method)
            r = requests.request(method, url, allow_redirects=redirect, headers=headers, params=params, stream=stream, data=request.data, timeout=timeout)
        else:
            log.debug('Sending %s headers' % method)
            r = requests.request(method, url, allow_redirects=redirect, headers=headers, params=params, stream=stream, timeout=timeout)

        headers_resp = dict(r.headers)
        if 'transfer-encoding' in headers_resp:
            del headers_resp['transfer-encoding']
        response_data = r.content
        status_code = r.status_code
        flask_response = Response(response=response_data,
                                  status=status_code,
                                  headers=headers_resp.items())
        log.debug('Response: \n\n  Headers: %s \n\n Data: %s \n\n StatusCode: %s \n\n Response: %s \n\n+++++++++++++++++++++++++++++++++++++++++++++' % \
        (headers_resp, response_data, status_code, flask_response.response))
    log.debug('################################### Exiting proxy ##############################################################\n\n\n')
    return flask_response

if __name__ == '__main__':
    if len(sys.argv) < 5:
        raise NameError('You have to indicate the host and the port of the proxy and the host and the port for the destination')
    app.run(host=str(sys.argv[1]), port=int(sys.argv[2]), debug=True)
