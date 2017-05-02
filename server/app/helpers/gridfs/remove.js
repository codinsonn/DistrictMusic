// Packages
require("rootpath")();
var Promise = require("pinkie");

// Helpers
var GridFS = require(__base + "app/middleware/gridfs");
var ObjectId = require(__base + "app/helpers/objectid");

module.exports = (id) => {

    return new Promise((resolve) => {

        GridFS.gfs.remove({
            _id: ObjectId(id)
        }, () => {
            resolve();
        });

    });

};
