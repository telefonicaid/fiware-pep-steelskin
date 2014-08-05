var config = {};

config.resource = {
    original: {
        host: 'localhost',
        port: 4000
    },
    proxy: {
        port: 8000,
        ssl: false
    }
};

config.access = {
    protocol: 'http',
    host: 'localhost',
    port: 7000,
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

module.exports = config;