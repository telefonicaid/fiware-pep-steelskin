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
/**
 * This options can be used to configure the address and options of the Access Control, responsible of the request
 * validation.
 */
config.access = {
    /**
     * Protocol to use to access the Access Control.
     */
    protocol: 'http',
    /**
     * Host where the Access Control is located.
     */
    host: 'localhost',
    /**
     * Port where the Access Control is listening.
     */
    port: 7000,
    /**
     * Path of the authentication action.
     */
    path: '/validate'
}

// User identity configuration
//--------------------------------------------------
/**
 * Information about the Identity Manager server from where the information about a user will be drawn.
 */
config.authentication = {
    module: 'idm',
    user: 'pepproxy',
    password: 'pepproxy',
    options: {
        protocol: 'http',
        host: 'localhost',
        port: 9000,
        path: '/v3/role_assignments',
        authPath: '/v3/auth/tokens'
    }
};


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
config.logLevel = 'FATAL';

// List of component middlewares
//-------------------------------------------------
/**
 * To validate the request, the proxy needs some information that is dependant of the component: the action that a
 * request is going to execute. How to detect the action given the request is component-specific logic, that can be
 * codified in a middleware-like function that will be executed before the user validation. This logic must populate
 * the 'action' parameter of the request.
 */
config.middlewares = {
    /**
     * Indicates the module from where the middlewares will be loaded.
     */
    require: 'lib/services/orionPlugin',

    /**
     * Indicates the list of middlewares to load.
     */
    functions: [
        'extractCBAction'
    ]
};

config.componentName = 'contextbroker';

module.exports = config;