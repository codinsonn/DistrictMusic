var socketWildcard = require("socketio-wildcard")();
// var sharedSession = require("express-socket.io-session");
var session = require("./session");
var ios = require("socket.io-express-session");

module.exports = function(app, io) {

    // Use wildcard socket.io middleware
    io.use(socketWildcard);

    // Use shared session for sockets
    // io.use(sharedSession(session, {
    //     autoSave: true
    // }));

    io.use(ios(session));

};
