// Packages
require("rootpath")();

//var Promise = require("pinkie");
var path = require("path");

// Helpers
var GridFS = require(__base + "app/middleware/gridfs");
var ObjectId = require("mongoose").Types.ObjectId;

module.exports = (readStream, filename, mimetype, extension) => {

    return new Promise((resolve, reject) => {

        var finished = false;

        var id = new ObjectId().toString();

        var writeStream = GridFS.gfs.createWriteStream({
            _id: id,
            filename: id,
            metadata: {
                originalFilename: filename,
                mimetype: mimetype,
                extension: extension
            }
        });

        writeStream.on('data', (chunk) => {
            console.log('[Upload] Writing some data, just dont know what');
        });

        writeStream.on('error', (err) => {
           console.log('[Upload] -!- Got the following error:', err, '-!-');
           reject(ObjectId);
        });

        writeStream.on('finish', (filen) => {
            if(filen) console.log('[Upload] Written file:', filen.name, '( id:', id, ')');
            if(!finished) resolve(id);
        });

        writeStream.on('end', (filen) => {
            if(filen) console.log('[Upload] Written file:', filen.name, '( id:', id, ')');
            if(!finished) resolve(id);
        });

        readStream.pipe(writeStream);

    });

};
