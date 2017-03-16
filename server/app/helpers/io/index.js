
// Helpers
var UserHelper = require(__base + "app/controllers/users/v1/helpers");
var ListenerHelper = require("./listener");
var EmitHelper = require("./emitter");

module.exports = function(io) {

  // Init io emitter
  EmitHelper.init(io);

  io.on("connection", (socket) => {

    //console.log('-?- [IO][Index] Attempting to connect user... -?-');

    // Check if user is logged in
    if (!socket.handshake.session.profile) {

      //console.log('-!- [IO][Index] User not logged in, aborting... -!-');

      // Set unauthorized message
      socket.emit("unauthorized", {
        err: "User not authorized"
      });

    } else {

      console.log('-+- ------------------------------------ [IO] User CONNECTED:', socket.handshake.session.profile.general.fullName, '|', socket.id, '----------------------------------------- -+-');

      if (socket.handshake.session.profile.hasOwnProperty("_id")) {

        //console.log('[IO][Index] Socket id: ', socket.id);

        // Assign socket id to user
        UserHelper.setSocketId(socket.handshake.session.profile, socket.id);
        //UserHelper.setSocketId(socket.handshake.session.profile._id.toString(), socket.id);
        //console.log('[IO][Index] Set socket id for user: ', socket.id, ' | old: ', socket.handshake.session.profile.meta.socketIds[0]);

        // Set wildcard method on the socket
        socket.on("*", (event) => {

          //console.log('[IO][Index] new event: ', event.data[0], event.data[1]);

          ListenerHelper(socket, event.data[0], event.data[1]);

        });

      }

      socket.on("disconnect", () => {

        // Check if profile exists on the session
        if (socket.handshake.session.hasOwnProperty("profile") && socket.handshake.session.profile.hasOwnProperty("_id")) {

          console.log('-/- ------------------------------------ [IO] User DISCONNECTED: ', socket.handshake.session.profile.general.fullName, '|', socket.id, '----------------------------------------------- -/-');

          // Delete socket id
          UserHelper.unsetSocketId(socket.handshake.session.profile._id.toString(), socket.id);

        }

      });

    }

  });/**/

};
