var _ = require("lodash");
var CronJob = require('cron').CronJob;
var path = require('path');
var fse = require('fs-extra');

var SongModel = require(__base + "app/models/song");

module.exports = function() {

  SongModel.find({'audio.isDownloaded': true}).exec((err, songs) => {

    if(err){
      console.log('-!- An error occured while copying audio files -!-\n', err, '\n-!-');
    }

    if(songs){

      _.forEach(songs, (song) => {

        var audioFilename = song.audio.filename;

        var uploadsFolder = `${__base}uploads/audio/`;
        var uploadedFilePath = path.resolve(uploadsFolder, audioFilename);

        var publicFolder = `${__base}public/assets/audio/`;
        var publicFilePath = path.resolve(publicFolder, audioFilename);

        fse.copySync(uploadedFilePath, publicFilePath);

      });

    }

  });

};

