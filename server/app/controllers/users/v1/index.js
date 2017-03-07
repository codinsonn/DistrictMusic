//var profile = require(__base + "./profile");
//var removeConnection = require(__base + "./removeConnection");
//var returnUser = require(__base + "./returnUser");
//var search = require(__base + "./search");
//var token = require(__base + "./token");
var userSession = require("./userSession");

module.exports = {
  userSession: userSession
  //profile: profile.init,
  //removeConnection: removeConnection.init,
  //returnUser: returnUser.init,
  //search: search.init
};
