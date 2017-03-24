var allowedToLogin = require("./allowedToLogin");
var findUser = require("./findUser");
var setSocketId = require("./setSocketId");
var unsetSocketId = require("./unsetSocketId");
var authorizeSpeaker = require("./authorizeSpeaker");
var checkSpeakerDisconnect = require("./checkSpeakerDisconnect");

module.exports = {
  allowedToLogin: allowedToLogin,
  findUser: findUser,
  setSocketId: setSocketId,
  unsetSocketId: unsetSocketId,
  authorizeSpeaker: authorizeSpeaker,
  checkSpeakerDisconnect: checkSpeakerDisconnect
};
