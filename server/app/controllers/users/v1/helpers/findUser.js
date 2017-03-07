// Packages
require("rootpath")();
var _ = require("lodash");

// Helpers
var PromiseHelper = require(__base + "app/helpers/promise");
var ObjectId = require(__base + "app/helpers/objectid");
//var RolesHelper = require(__base + "app/helpers/roles");

// Models
var UserModel = require(__base + "app/models/user");

// Vars
var excludeByDefault = {
    "meta.socketIds": 0,
    "meta.googleId": 0,
    "meta.googleAuthToken": 0,
    "meta.googleRefreshToken": 0,
    "meta.enabled": 0,
    "meta.created": 0,
    "meta.lastModified": 0,
    "meta.code": 0,
    "general.email": 0
};

var includeByDefault = {
    "general.fullName": 1,
    "general.firstName": 1,
    "general.lastName": 1,
    "general.profileImage": 1,
};

var itemsToPopulate = [];

var defaultPopulate = [];

module.exports = function(id, defaultInclude, filter, populate, email, profile) {

    console.log('Test');

    if (defaultInclude) { // Set default include values if available
        filter = _.cloneWith(includeByDefault);
    } else if (filter) { // Set filter to filter varialbe
        filter = _.cloneWith(filter);
    } else {  // Set default exclude
        filter = _.cloneWith(excludeByDefault);
    }
    if (email !== true) {
        email = false;
    }

    if (email && defaultInclude) { // Add email if we need the email and default include is enabled
        filter["general.email"] = 1;
    } else if (email) { // Delete email exclude filter
        // Return email
        delete filter["general.email"];
    }

    var paths = "";
    var user;

    if (populate) { // Check if fields need to be populated
        paths = itemsToPopulate;
    } else {
        paths = defaultPopulate;
    }

    return UserModel
        .findOne({
            _id: ObjectId(id)
        }, filter)
        .lean()
        .populate(paths)
        .exec()
        .then(function onSuccess(response) {
            // Return the user object
            return user;
        },
        PromiseHelper.throwError)
    ;

};
