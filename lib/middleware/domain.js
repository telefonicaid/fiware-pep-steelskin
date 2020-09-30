/*
 * Copyright 2014 Telefonica Investigación y Desarrollo, S.A.U
 *
 * This file is part of fiware-pep-steelskin
 *
 * fiware-pep-steelskin is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * fiware-pep-steelskin is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with fiware-pep-steelskin.
 * If not, seehttp://www.gnu.org/licenses/.
 *
 * For those usages not covered by the GNU Affero General Public License
 * please contact with::[iot_support@tid.es]
 */

'use strict';

var domain = require('domain'),
    uuid = require('uuid'),
    constants = require('../constants');

var logger = require('logops');

var CORRELATOR_HEADER = 'Fiware-correlator';

/**
 * Express middleWare that creates a domain per request
 * It also generates a unique request id that can be used to track requests in logs.
 *
 * @return {Function} Express middleWare.
 */
function requestDomain() {

    return function requestDomain(req, res, next) {
        var reqDomain = domain.create();
        var cleanDomain, domainErrorHandler, requestHandler;
        reqDomain.add(req);
        reqDomain.add(res);
        reqDomain.path = req.path;
        reqDomain.op = req.url;
        reqDomain.start = Date.now();

        if (req.headers && req.headers[constants.ORGANIZATION_HEADER]) {
            reqDomain.srv = req.headers[constants.ORGANIZATION_HEADER];
        }

        if (req.headers && req.headers[constants.PATH_HEADER]) {
            reqDomain.subsrv = req.headers[constants.PATH_HEADER];
        }

        // x-forwarded-for/forwarded overwrites x-real-ip
        if (req.headers[constants.X_REAL_IP_HEADER]) {
            reqDomain.from = req.headers[constants.X_REAL_IP_HEADER];
        }
        if (req.headers[constants.X_FORWARDED_FOR_HEADER]) {
            reqDomain.from = req.headers[constants.X_FORWARDED_FOR_HEADER];
        }
        if (req.headers[constants.FORWARDED_HEADER]) {
            reqDomain.from = req.headers[constants.FORWARDED_HEADER];
        }

        domainErrorHandler = function(err) {
            logger.error(err);
            cleanDomain();
        };

        cleanDomain = function() {
            var responseTime = Date.now() - reqDomain.start;
            logger.debug('response-time: ' + responseTime + ' statusCode: ' + res.statusCode);
            reqDomain.removeListener('error', domainErrorHandler);
            reqDomain.remove(req);
            reqDomain.remove(res);
            delete reqDomain.trans;
            delete reqDomain.corr;
            delete reqDomain.op;
            delete reqDomain.from;
            delete reqDomain.srv;
            delete reqDomain.subsrv;
            delete reqDomain.path;
            reqDomain.exit();
        };

        requestHandler = function() {
            reqDomain.trans = req.requestId = uuid.v4();
            var corr = req.get(CORRELATOR_HEADER);
            if (corr) {
                reqDomain.corr = corr;
            } else {
                reqDomain.corr = reqDomain.trans;
            }
            res.set(CORRELATOR_HEADER, reqDomain.corr);

            next();
        };

        res.once('finish', cleanDomain);
        reqDomain.on('error', domainErrorHandler);
        reqDomain.enter();
        reqDomain.run(requestHandler);

    };

}

exports.requestDomain = requestDomain;
