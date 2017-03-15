// Packages
require("rootpath")();

// Helpers
var ObjectId = require(__base + "app/helpers/objectid");

// Models
var UserModel = require(__base + "app/models/user");

module.exports = function(profileId, socketId) {

  return UserModel.update({ _id: ObjectId(profileId) }, { $pull: { "meta.socketIds": socketId } })
    .exec();

};
