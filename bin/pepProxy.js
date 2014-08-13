#!/usr/bin/env node

var proxy = require('../lib/fiware-orion-pep'),
    config = require('../config');


function loadConfiguration() {
    if (process.env.PROXY_PORT) {
        config.resource.proxy.port = process.env.PROXY_PORT;
    }
    if (process.env.TARGET_HOST) {
        config.resource.original.host = process.env.PROXY_PORT;
    }
    if (process.env.TARGET_PORT) {
        config.resource.original.port = process.env.TARGET_PORT;
    }
    if (process.env.LOG_LEVEL) {
        config.logLevel = process.env.LOG_LEVEL;
    }
    if (process.env.ACCESS_HOST) {
        config.access.host = process.env.ACCESS_HOST;
    }
    if (process.env.ACCESS_PORT) {
        config.access.port = process.env.ACCESS_PORT;
    }
    if (process.env.AUTHENTICATION_HOST) {
        config.authentication.host = process.env.AUTHENTICATION_HOST;
    }
    if (process.env.AUTHENTICATION_PORT) {
        config.authentication.port = process.env.AUTHENTICATION_PORT;
    }
    if (process.env.PROXY_USERNAME) {
        config.authentication.username = process.env.PROXY_USERNAME;
    }
    if (process.env.PROXY_PASSWORD) {
        config.authentication.password = process.env.PROXY_PASSWORD;
    }
}

loadConfiguration();

proxy.start(function(error, proxyObj) {
    var module;

    if (error) {
        process.exit();
    } else {
        console.log('Loading middlewares');
        module = require('../' + config.middlewares.require);

        for (var i in config.middlewares.functions) {
            proxyObj.middlewares.push(module[config.middlewares.functions[i]]);
        }

        console.log('Server started');
    }
});
