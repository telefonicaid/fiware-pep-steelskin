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

from flask import Flask, request, Response
import requests
import sys
import collections
from iotqautils.iotqaLogger import get_logger

app = Flask(__name__)


log = get_logger('proxy_ks')

requested = ''
last_path = ''


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
    log.debug('********************************* Entring in proxy***********************************************************')
    if path == 'last_path':
        ret_last_path = last_path
        last_path = ''
        return ret_last_path
    else:
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
        content_type = headers_resp['content-type']
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
