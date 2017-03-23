require("rootpath")();

module.exports = {
    production: false,
    logs: true,
    server: {
        port: 3020,
        domain: "http://localhost:3020/",
        frontend: "http://localhost:3020/",
        frontendPath: "public/"
    },
    mongo: {
        db: "district-music-local",
        url: "localhost" //"127.0.0.1:27017"
    },
    session: {
        domain: ""
    }
};
