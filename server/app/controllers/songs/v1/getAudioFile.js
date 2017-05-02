// Packages
require("rootpath")();
var _ = require("lodash");
var path = require('path');

// Helpers
var SongHelper = require(__base + "app/controllers/songs/v1/helpers");
var GridFSHelper = require(__base + "app/helpers/gridfs");

// Models
var SongModel = require(__base + "app/models/song");

module.exports = (req, res, done) => {

  SongModel.findOne({ 'audio.filename': req.params.filename }, (err, song) => {

    if(err) {
      console.log('-!- [GetAudioFile:18] -!- Error occured while searching for audio file -!-');
      res.statusCode = 400;
      return res.json({ errors: [ 'Could not search for song in db' ] });
    }

    if(song) {

      GridFSHelper.download(req, res, song.audio.fileId);

    } else {
      console.log('-!- [GetAudioFile:29] -!- Song for audiofile not found -!-');
      res.statusCode = 404;
      return res.json({ errors: [ 'Could not find song' ] });
    }

  });

};
