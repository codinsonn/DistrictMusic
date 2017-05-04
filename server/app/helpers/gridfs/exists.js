// Packages
require("rootpath")();
//var Promise = require("pinkie");

// Helpers
var GridFS = require(__base + "app/middleware/gridfs");
var ObjectId = require(__base + "app/helpers/objectid");

module.exports = (id) => {

    return new Promise((resolve, reject) => {

        //GridFS.gfs.findOne({ _id: ObjectId(id) }, (err, file) => {
        GridFS.gfs.exist({ _id: ObjectId(id) }, (err, file) => {

            if (err || !file) {

                reject(err);

            } else {

                GridFS.gfs.files.findOne({ _id: ObjectId(id) }, (err, f) => {

                  console.log('[Exists] File found...?');

                  if (err || !f) {

                    reject(err);

                  } else {

                    console.log('-i- Found File -i-', f._id);
                    resolve(f);

                  }

                });

            }

        });

    });

};
