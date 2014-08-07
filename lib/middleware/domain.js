'use strict';

var domain = require('domain'),
    uuid = require('node-uuid');

var logger = require('fiware-node-logger');

var CORRELATOR_HEADER = 'Unica-Correlator';

/**
 * Express middleWare that creates a domain per request
 * It also generates a unique request id that can be used to track requests in logs.
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
