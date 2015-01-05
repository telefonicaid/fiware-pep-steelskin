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


import sys, json
from flask import Flask, request


app = Flask(__name__)

requested = ''
path_access = ''

# @app.route('/', defaults={'path': ''}, methods=['GET', 'POST', 'UPDATE', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'])
# @app.route('/<path:path>', methods=['GET', 'POST', 'UPDATE', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'])
# def proxy(path):
#     print 'ALL'


@app.route('/v1/updateContext', methods=['POST'])
@app.route('/v1/queryContext', methods=['POST'])
@app.route('/v1/subscribeContext', methods=['POST'])
@app.route('/v1/updateContextSubscription', methods=['POST'])
@app.route('/v1/unsubscribeContext', methods=['POST'])
@app.route('/v1/registry/registerContext', methods=['POST'])
@app.route('/v1/registry/discoverContextAvailability', methods=['POST'])
@app.route('/v1/registry/subscribeContextAvailability', methods=['POST'])
@app.route('/v1/registry/updateContextAvailabilitySubscription', methods=['POST'])
@app.route('/v1/registry/unsubscribeContextAvailability', methods=['POST'])
def cb_standard():
    global requested
    requested = request.data
    headers = dict(request.headers)
    return request.data, 200, headers


@app.route('/v1/contextEntities/<path:path>', methods=['GET', 'POST', 'DELETE', 'PUT'])
@app.route('/v1/registry/contextEntities/<path:path>', methods=['GET', 'POST', 'DELETE', 'PUT'])
@app.route('/v1/contextEntityTypes/<path:path>', methods=['GET', 'POST', 'DELETE', 'PUT'])
@app.route('/v1/registry/contextEntityTypes/<path:path>', methods=['GET', 'POST', 'DELETE', 'PUT'])
@app.route('/v1/contextSubscriptions/<path:path>', methods=['GET', 'POST', 'DELETE', 'PUT'])
@app.route('/v1/registry/contextAvailabilitySubscriptions/<path:path>', methods=['GET', 'POST', 'DELETE', 'PUT'])
def cb_convenience(path):
    global requested
    global path_access
    requested = request.data
    path_access = path
    headers = dict(request.headers)
    return request.data, 200, headers

@app.route('/v1/contextSubscriptions', methods=['GET', 'POST', 'DELETE', 'PUT'])
@app.route('/v1/registry/contextAvailabilitySubscriptions', methods=['GET', 'POST', 'DELETE', 'PUT'])
def cb_convenience_without_path():
    global requested
    requested = request.data
    headers = dict(request.headers)
    return request.data, 200, headers

@app.route('/last_value', methods=['GET'])
def last_value():
    global requested
    global path_access
    if requested != '':
        resp = {"resp": str(requested), "path": str(path_access)}
        requested = ''
        path_access = ''
        return json.dumps(resp), 200
    else:
        return 'There is no value in request', 201


@app.route('/notices', methods=['POST'])
@app.route('/rules', methods=['GET', 'POST'])
@app.route('/vrules', methods=['GET', 'POST'])
def cep_withoutpath():
    global requested
    requested = request.data
    headers = dict(request.headers)
    return request.data, 200, headers


@app.route('/rules/<path:path>', methods=['GET', 'DELETE'])
@app.route('/m2m/<path:path>', methods=['GET', 'DELETE', 'PUT', 'POST'])
def cb_withpath(path):
    global requested
    global path_access
    requested = request.data
    path_access = path
    headers = dict(request.headers)
    return request.data, 200, headers



@app.route('/pap/v1', methods=['DELETE'])
def ac_withoutpath():
    global requested
    requested = request.data
    headers = dict(request.headers)
    return request.data, 200, headers


@app.route('/pap/v1/<path:path>', methods=['GET', 'DELETE', 'POST'])
def ac_withpath(path):
    global requested
    global path_access
    requested = request.data
    path_access = path
    headers = dict(request.headers)
    return request.data, 200, headers


if __name__ == '__main__':
    if len(sys.argv) < 3:
        raise NameError('You have to indicate the host and the port of the mock')
    app.run(host=str(sys.argv[1]), port=int(sys.argv[2]), debug=True)