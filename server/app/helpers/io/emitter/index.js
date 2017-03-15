// Packages
var _ = require("lodash");

// Vars
this.io;

var set = module.exports.set = (type) => {

    switch (type) {

      case "DOWNLOAD_PROGRESS":
        return "DOWNLOAD_PROGRESS";
        break;

      case "UPDATED_SOCKET_ID":
        return "UPDATED_SOCKET_ID";
        break;

      default:
        return "default";
        break;

    }

};

var sendAll = (socketIds, type, data) => {

  _.forEach(socketIds, (socketId) => {
    console.log('-- [IO][Emitter] Emitting to: ', socketId, '--');
    this.io.to(socketId).emit(set(type), data);
  });

};

module.exports.sendAll = sendAll;

module.exports.emit = (type, tokens, data) => {

  if(tokens.length > 0){
    sendAll(tokens, type, data);
  }

};

// Init io in the listener
module.exports.init = (_io) => {

  this.io = _io;

};
