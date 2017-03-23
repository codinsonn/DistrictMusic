require("rootpath")();
var platforms = require("./platforms");

module.exports = {
    production: false,
    logs: false,
    server: {
        port: 3020,
        domain: "http://districtmusic.herokuapp.com/",
        frontend: "http://districtmusic.herokuapp.com/",
        frontendPath: "public/"
    },
    mongo: {
        db: "district-music-development",
        url: "127.0.0.1:27017"
    },
    session: {
        domain: ""
    }
};
