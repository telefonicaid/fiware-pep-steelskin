var config = {};

// Protected Resource configuration
//--------------------------------------------------
// Configures the address of the component that is being proxied and the address of the proxy itself.
config.resource = {
    original: {
        /**
         * Host that is being proxied.
         */
        host: 'localhost',

        /**
         * Port where the proxied server is listening.
         */
        port: 10026
    },

    proxy: {
        /**
         * Port where the proxy is listening.
         */
        port: 1026
    }
};

// Access Control configuration
//--------------------------------------------------
// This options can be used to configure the address and options of the Keystone Proxy, resposible of the request
// validation.
config.access = {
    /**
     * Protocol to use to access the Keystone Proxy.
     */
    protocol: 'http',
    /**
     * Host where the Keystone Proxy is located.
     */
    host: 'localhost',
    /**
     * Port where the keystone Proxy is listening.
     */
    port: 7000,
    /**
     * Path of the authentication action.
     */
    path: '/validate'
}

// Security configuration
//--------------------------------------------------
config.ssl = {
    /**
     * This flag activates the HTTPS protocol in the server. The endpoint always listen to the indicated port
     * independently of the chosen protocol.
     */
    active: false,

    /**
     * Key file to use for codifying the HTTPS requests. Only mandatory when the flag active is true.
     */
    keyFile: '',

    /**
     * SSL Certificate to present to the clients. Only mandatory when the flag active is true.
     */
    certFile: ''
}

/**
 * Default log level. Can be one of: 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'
 * @type {string}
 */
config.logLevel = 'DEBUG';

module.exports = config;