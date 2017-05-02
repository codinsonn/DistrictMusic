// Packages
require("rootpath")();

// Helpers
var GridFS = require(__base + "app/middleware/gridfs");
var exists = require("./exists");
var ObjectId = require(__base + "app/helpers/objectid");

module.exports = (res, id) => {

    exists(id)
        .then(onSuccess = (file) => {

            var readstream = GridFS.gfs.createReadStream({
                _id: ObjectId(id)
            });

            res.setHeader("Content-Type", file.metadata.mimetype);
            readstream.pipe(res);

        }, onError = () => {

            console.log('[Download] -!- File not found / in db -!-');

        })
    ;

};
