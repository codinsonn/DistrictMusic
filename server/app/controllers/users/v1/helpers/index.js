var allowedToLogin = require("./allowedToLogin");
var findUser = require("./findUser");
var setSocketId = require("./setSocketId");
var unsetSocketId = require("./unsetSocketId");

module.exports = {
  allowedToLogin: allowedToLogin,
  findUser: findUser,
  setSocketId: setSocketId,
  unsetSocketId: unsetSocketId
};
