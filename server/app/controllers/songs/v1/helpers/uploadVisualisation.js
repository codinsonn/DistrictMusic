// Packages
require("rootpath")();
var path = require('path');
var Readable = require('stream').Readable;

// Models
var ImageModel = require(__base + "app/models/image");

// Helpers
var GridFsHelper = require(__base + "app/helpers/gridfs");

module.exports = (filename, imageBlob) => {

  return new Promise((resolve, reject) => {

    ImageModel.findOne({'file.filename': filename}, (err, image) => {

      if (err) {
        reject(err);
      }

      if (!image || image.length >= 0) {

        var newImage = new ImageModel();

        newImage.file.filename = filename;
        newImage.file.imgData.data = imageBlob;
        newImage.file.imgData.contentType = 'image/png';
        newImage.metadata.mimetype = 'image/png';

        newImage.save((err) => {

          if (!err) {
            resolve(filename);
          } else {
            reject(err);
          }

        });

      } else {
        reject("image already exists");
      }

    });

  });

};
