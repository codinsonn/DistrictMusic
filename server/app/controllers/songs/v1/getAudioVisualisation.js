// Packages
require("rootpath")();
var _ = require("lodash");
var path = require('path');
var fs = require('fs');

// Models
var ImageModel = require(__base + "app/models/image");

// Helpers
var GridFSHelper = require(__base + "app/helpers/gridfs");

module.exports = (req, res, done) => {

  ImageModel.findOne({'file.filename': req.params.filename}, (err, image) => {

    if(err) {
      console.log('-!- [GetAudioVisualisation:14] -!- Error occured while searching for audio visualisation -!-');
      res.statusCode = 400;
      return res.json({ errors: [ 'Could not search for audio visualisation in db' ] });
    }

    if(image) {

      console.log('-/- [GetAudioVisualisation:21] Returning image -/-', image.metadata.mimetype, image.file.imgData.data.length);

      var matches = image.file.imgData.data.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/),response = {};
      var decodedImage = new Buffer(matches[2], 'base64');

      res.setHeader("Content-Type", image.metadata.mimetype);
      res.setHeader("Content-Length", decodedImage.length);

      return res.end(decodedImage);

    } else {
      console.log('-!- [GetAudioVisualisation:27] -!- Visualisation for audio not found -!-');
      res.statusCode = 404;
      return res.json({ errors: [ 'Could not find audio visuals' ] });
    }

  });

};
