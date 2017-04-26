// Helpers
var UserHelper = require(__base + "app/controllers/users/v1/helpers");
var EmitHelper = require(__base + "app/helpers/io/emitter");

module.exports = function(socket, event, data) {

  switch (event) {

    case "SET_SESSION_SOCKET_ID":
      socket.handshake.session.profile.socketIds = [socket.id];
      UserHelper.setSocketId(socket.handshake.session.profile, socket.id);
      break;

    case "UPDATE_SPEAKER_POS":
      //console.log('[SPEAKER] Recieved: Updating speaker pos!', data);
      EmitHelper.broadcast('SPEAKER_POS_UPDATED', data);
      break;

    case "SOCKET_ID_CHANGED":
      break;

    default:
      console.log("Socket type not defined:", event); // eslint-disable-line no-console

  }

};
