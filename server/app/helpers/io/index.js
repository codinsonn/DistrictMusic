
// Helpers
var UserHelper = require(__base + "app/controllers/users/v1/helpers");
var ListenerHelper = require("./listener");
var EmitHelper = require("./emitter");

module.exports = function(io) {

  // Init io emitter
  EmitHelper.init(io);

  io.on("connection", (socket) => {

    //console.log('-?- [IO][Index] Attempting to connect user... -?-');

    socket.emit("CONNECTED", socket.id);

    // Set wildcard method on the socket
    socket.on("*", (event) => {

      //console.log('[IO][Index] new event: ', event.data[0], event.data[1]);

      ListenerHelper(socket, event.data[0], event.data[1]);

    });

    if (socket.handshake.session.profile) {

      console.log('-+- ------------------------------------ [IO] User CONNECTED:', socket.handshake.session.profile.general.fullName, '|', socket.id, '----------------------------------------- -+-');

      if (socket.handshake.session.profile.hasOwnProperty("_id")) {

        //console.log('[IO][Index] Socket id: ', socket.id);

        // Assign socket id to user
        UserHelper.setSocketId(socket.handshake.session.profile, socket.id);

      }

    }else{

      console.log('-+- ------------------------------------ [IO] Non-User Connected: ', socket.id, '----------------------------------------------- -+-');

    }

    socket.on("disconnect", () => {

      // Check if profile exists on the session
      if (socket.handshake.session.hasOwnProperty("profile") && socket.handshake.session.profile.hasOwnProperty("_id")) {

        console.log('-/- ------------------------------------ [IO] User DISCONNECTED: ', socket.handshake.session.profile.general.fullName, '|', socket.id, '----------------------------------------------- -/-');

        // Delete socket id
        UserHelper.unsetSocketId(socket.handshake.session.profile._id.toString(), socket.id);

      }else{

        console.log('-/- ------------------------------------ [IO] Non-User Disconnected: ', socket.id, '----------------------------------------------- -/-');

        // Check if it was the speaker that disconnected
        UserHelper.checkSpeakerDisconnect(socket.id);

      }

    });

  });/**/

};
