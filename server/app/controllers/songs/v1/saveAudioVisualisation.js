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

      var imgFilename = `img${song.general.id}${req.params.type}.png`;
      var prgFilename = `prg${song.general.id}${req.params.type}.png`;

      console.log('imgFile:', imgFilename, '| prgFile:', prgFilename);

      SongHelper.uploadVisualisation(imgFilename, req.body.imageData).then(imgFilename => {

        if (req.params.type === 'bars') song.waveform.barsImage = imgFilename;
        if (req.params.type === 'wave') song.waveform.waveImage = imgFilename;

        SongHelper.uploadVisualisation(prgFilename, req.body.progressData).then(prgFilename => {

          if (req.params.type === 'bars') song.waveform.barsProgress = prgFilename;
          if (req.params.type === 'wave') song.waveform.waveProgress = prgFilename;

          if (req.params.type === 'bars') song.waveform.barsSaved = true;
          if (req.params.type === 'wave') song.waveform.waveSaved = true;

          song.save((err) => {

            if (!err) {

              console.log('-/- [SaveAudioVisualisation:41] -/- Saved visualisations to db');
              res.statusCode = 200;
              return res.json(song);

            }

          });

        }, failData => {

          console.log('-!- [SaveAudioVisualisation:53] -!- Unable to save progress visualisation -!-', failData);
          res.statusCode = 404;
          return res.json({ errors: [ 'Could not save progress visualisation' ] });

        });

      }, failData => {

        console.log('-!- [SaveAudioVisualisation:59] -!- Unable to save image visualisation -!-', failData);
        res.statusCode = 404;
        return res.json({ errors: [ 'Could not save image visualisation' ] });

      });

    } else {

      console.log('-!- [SaveAudioVisualisation:67] -!- Song for audio visualisation not found -!-');
      res.statusCode = 404;
      return res.json({ errors: [ 'Could not find song' ] });

    }

  });

};
