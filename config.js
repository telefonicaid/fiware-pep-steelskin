var config = {};

config.resource = {
    original: {
        host: 'localhost',
        port: 4000
    },
    proxy: {
        port: 8000
    }
};

config.access = {
    host: 'localhost',
    port: 7000,
    path: '/validate'
}

module.exports = config;