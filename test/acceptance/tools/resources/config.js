var config = {};

// Protected Resource configuration
//--------------------------------------------------
// Configures the address of the component that is being proxied and the address of the proxy itself.
config.resource = {
    original: {
        /**
         * Host that is being proxied.
         */
        host: '192.168.1.36',

        /**
         * Port where the proxied server is listening.
         */
        port: 1027
    },

    proxy: {
        /**
         * Port where the proxy is listening.
         */
        port: 1025
    }
};

// Access Control configuration
//--------------------------------------------------
/**
 * This options can be used to configure the address and options of the Access Control, responsible of the headers
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
    host: '192.168.1.36',
    /**
     * Port where the Access Control is listening.
     */
    port: 8082,
    /**
     * Path of the authentication action.
     */
    path: '/pdp/v3'
}

// User identity configuration
//--------------------------------------------------
/**
 * Information about the Identity Manager server from where the information about a user will be drawn.
 */
config.authentication = {
    module: 'keystone',
    user: 'pep',
    password: 'pep',
    domainName: 'admin_domain',
    retries: 0,
    cacheTTLs: {
        users: 1000,
        projectIds: 1000,
        roles: 60
    },
    options: {
        protocol: 'http',
        host: '192.168.1.36',
        port: 5001,
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
 */
config.logLevel = 'DEBUG';

// List of component middlewares
//-------------------------------------------------
/**
 * To validate the headers, the proxy needs some information that is dependant of the component: the action that a
 * headers is going to execute. How to detect the action given the headers is component-specific logic, that can be
 * codified in a middleware-like function that will be executed before the user validation. This logic must populate
 * the 'action' parameter of the headers.
 */
config.middlewares = {
    /**
     * Indicates the module from where the middlewares will be loaded.
     */
    require: 'lib/plugins/perseoPlugin',

    /**
     * Indicates the list of middlewares to load.
     */
    functions: [
        'extractAction'
    ]
};

/**
 * Name of the component. It will be used in the generation of the FRN.
 */
config.componentName = 'orion';

/**
 * Prefix to use in the FRN (Not to change, usually).
 */
config.resourceNamePrefix = 'fiware:';

/**
 * Indicates whether this PEP should have an admin bypass or not. If it does, whenever a user headers arrives to the
 * PEP from a user that has the role defined in the "adminRoleId" property, that headers is not validated against the
 * Access Control, but it is automatically proxied instead.
 */
config.bypass = false;

/**
 * ID of the admin user if it exists. Only effective if the "bypass" property is true.
 */
config.bypassRoleId = '';

module.exports = config;