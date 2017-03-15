// Helpers
var UserHelper = require(__base + "app/controllers/users/v1/helpers");
var Helpers = require("./helpers");

module.exports = function(socket, event, data) {

  console.log('- [IO][Listener] new event: ', event, data, ' -');

  switch (event) {

    case "SET_SESSION_SOCKET_ID":
      console.log('- [IO][Listener] ----- SET_SESSION_SOCKET_ID -', socket.id, data);
      socket.handshake.session.profile.socketIds = [socket.id];
      UserHelper.setSocketId(socket.handshake.session.profile, socket.id);
      break;

    case "UPDATED_SOCKET_ID":
      console.log('- [IO][Listener] ----- UPDATED_SOCKET_ID -', socket.id);
      socket.emit("UPDATED_SOCKET_ID", data);
      break;

    case "DOWNLOAD_PROGRESS":
      console.log('- [IO][Listener] ----- DOWNLOAD_PROGRESS -', socket.id);
      socket.emit("DOWNLOAD_PROGRESS", data);
      break;

    default:
      console.log("Socket type not defined."); // eslint-disable-line no-console

  }

};
