/*
 * Copyright 2014 Telefonica Investigación y Desarrollo, S.A.U
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
 * please contact with::[iot_support@tid.es]
 */

'use strict';

var domain = require('domain'),
    uuid = require('node-uuid');

var logger = require('logops');

var CORRELATOR_HEADER = 'Unica-Correlator';

/**
 * Express middleWare that creates a domain per headers
 * It also generates a unique headers id that can be used to track requests in logs.
 *
 * @return {Function} Express middleWare.
 */
function requestDomain() {

    return function requestDomain(req, res, next) {
        var reqDomain = domain.create();
        reqDomain.add(req);
        reqDomain.add(res);
        reqDomain.path = req.path;
        reqDomain.op = req.url;
        reqDomain.start = Date.now();

        function cleanDomain() {
            var responseTime = Date.now() - reqDomain.start;
            logger.debug('response-time: ' + responseTime + ' statusCode: ' + res.statusCode);
            reqDomain.removeListener('error', domainErrorHandler);
            reqDomain.remove(req);
            reqDomain.remove(res);
            delete reqDomain.trans;
            delete reqDomain.corr;
            delete reqDomain.op;
            delete reqDomain.path;
            reqDomain.exit();
        }

        function domainErrorHandler(err) {
            logger.error(err);
            cleanDomain();
        }

        function requestHandler() {
            reqDomain.trans = req.requestId = uuid.v4();
            var corr = req.get(CORRELATOR_HEADER);
            if (corr) {
                reqDomain.corr = corr;
            } else {
                reqDomain.corr = reqDomain.trans;
            }
            res.set(CORRELATOR_HEADER, reqDomain.corr);
            next();
        }

        res.once('finish', cleanDomain);
        reqDomain.on('error', domainErrorHandler);
        reqDomain.enter();
        reqDomain.run(requestHandler);

    };

}

exports.requestDomain = requestDomain;
