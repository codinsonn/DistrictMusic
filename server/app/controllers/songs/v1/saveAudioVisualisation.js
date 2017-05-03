// Packages
require("rootpath")();
var _ = require("lodash");
var path = require('path');

// Helpers
var SongHelper = require(__base + "app/controllers/songs/v1/helpers");

// Models
var SongModel = require(__base + "app/models/song");

module.exports = (req, res, done) => {

  SongModel.findOne({ 'general.id': req.params.song_id }, (err, song) => {

    if(err) {
      console.log('-!- [SaveAudioVisualisation:18] -!- Error occured while searching for song -!-');
      res.statusCode = 400;
      return res.json({ errors: [ 'Could not search for song in db' ] });
    }

    if(song) {

      console.log('[SaveAudioVisualisation:] imageData:', req.body.imageData);
      console.log('[SaveAudioVisualisation:] progressData:', req.body.progressData);

      /*SongHelper.downloadVisualisation().then(imageId => {

      }, failData => {

      });*/

    } else {
      console.log('-!- [SaveAudioVisualisation:29] -!- Song for audio visualisation not found -!-');
      res.statusCode = 404;
      return res.json({ errors: [ 'Could not find song' ] });
    }

  });

};
