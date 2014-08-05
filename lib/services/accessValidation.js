/*
 * Copyright 2013 Telefonica Investigación y Desarrollo, S.A.U
 *
 * This file is part of fiware-orion-pep
 *
 * fiware-orion-pep is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * fiware-orion-pep is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with fiware-orion-pep.
 * If not, seehttp://www.gnu.org/licenses/.
 *
 * For those usages not covered by the GNU Affero General Public License
 * please contact with::[daniel.moranjimenez@telefonica.com]
 */

'use strict';

var request = require('request'),
    async = require('async'),
    apply = async.apply,
    config = require('../../config'),
    errors = require('../errors'),
    mustache = require('mustache'),
    fs = require('fs'),
    sax = require('sax'),
    requestTemplate;

function createAccessRequest(userToken, organization, action, callback) {
    var parameters = {
        organization: organization,
        subjectId: userToken,
        action: action
    };

    callback(null, mustache.render(requestTemplate, parameters));
}

function sendAccessRequest(accessPayload, callback) {
    var options = {
        uri: 'http://' + config.access.host + ':' + config.access.port + config.access.path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/xml',
            'Accept': 'application/xml'
        },
        body: accessPayload
    };

    request(options, function processResponse(error, response, body) {
        if (error) {
            // TODO: create the appropriate error
            callback(error);
        } else if (response.statusCode != 200) {
            // TODO: create the appropriate error
            callback("Wrong status code: " + response.statusCode);
        } else {
            callback(null, body);
        }
    });
}

function parseResponse(body, callback) {
    var parser = sax.parser(true),
        readingDecision = false,
        decision;

    parser.onerror = function (e) {
        var error = new errors.WRONG_XML_PAYLOAD();

        error.moreInfo = e;
        callback(error);
    };

    parser.ontext = function (t) {
        if (readingDecision) {
            if (!decision) {
                decision = t;
            } else {
                decision = decision + t;
            }
        }
    };

    parser.onopentag = function (node) {
        if (node.name.toUpperCase() === 'DECISION') {
            readingDecision = true;
        } else {
            readingDecision = false;
        }
    };

    parser.onend = function () {
        if (decision) {
            callback(null, decision.trim());
        } else {
            callback(new errors.WRONG_XML_PAYLOAD());
        }
    };

    parser.write(body).close();
}

function validate(decision, callback) {
    if (decision.toUpperCase() === 'PERMIT') {
        callback();
    } else {
        //TODO: change for the appropriate error
        callback("Denied access");
    }
}

function validationProcess(req, res, callback) {
    async.waterfall([
        apply(createAccessRequest, req.userId, req.organization, req.action),
        sendAccessRequest,
        parseResponse,
        validate
    ], function (error) {
        if (error) {
            callback(error);
        } else {
            callback(null, req, res);
        }
    });
}

function loadTemplates(callback) {
    fs.readFile('./lib/templates/validationRequest.xml', 'utf8', function templateLoaded(error, templateData) {
        if (error) {
            // TODO: change for the appropriate error
            callback(error);
        } else {
            requestTemplate = templateData;
            callback();
        }
    });
}

exports.validate = validationProcess;
exports.init = loadTemplates;