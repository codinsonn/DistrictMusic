require("rootpath")();
//var platforms = require("./platforms");

module.exports = {
    production: false,
    logs: true,
    server: {
        port: 3020,
        domain: "http://localhost:3020/",
        frontend: "http://localhost:8005/",
        frontendPath: "public/"
    },
    mongo: {
        db: "disctrict-music-local",
        url: "localhost" //"127.0.0.1:27017"
    },
    session: {
        domain: ""
    },
    redis: {
        host: "localhost",
        port: 6379
    },
    react: {
        baseUrl: "http://localhost:3020/",
        socketUrl: "http://localhost:3020/",
        path: "deploy/web/"/*,
        platforms: platforms*/
    },
    strategies: {

    }
};
