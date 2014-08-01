var config = {};

config.resource = {
    original: {
        host: "localhost",
        port: 4000
    },
    proxy: {
        port: 8000,
        ssl: true
    }
};

module.exports = config;