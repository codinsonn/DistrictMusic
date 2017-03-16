// Helpers
var UserHelper = require(__base + "app/controllers/users/v1/helpers");
var Helpers = require("./helpers");

module.exports = function(socket, event, data) {

  //console.log('- [IO][Listener] new event: ', event, data, ' -');

  switch (event) {

    case "SET_SESSION_SOCKET_ID":
      //console.log('- [IO][Listener] ----- SET_SESSION_SOCKET_ID -', socket.id, data);
      socket.handshake.session.profile.socketIds = [socket.id];
      UserHelper.setSocketId(socket.handshake.session.profile, socket.id);
      break;

    default:
      console.log("Socket type not defined."); // eslint-disable-line no-console

  }

};
