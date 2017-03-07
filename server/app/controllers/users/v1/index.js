var profile = require("./profile");
var removeConnection = require("./removeConnection");
var returnUser = require("./returnUser");
var search = require("./search");
var token = require("./token");

module.exports = {
    profile: profile.init,
    removeConnection: removeConnection.init,
    returnUser: returnUser.init,
    search: search.init
};
