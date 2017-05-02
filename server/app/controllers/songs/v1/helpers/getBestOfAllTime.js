// Packages
var _ = require("lodash");
require("rootpath")();

// Config
var config = require(__base + "config");

// Helpers
var EmitHelper = require(__base + "app/helpers/io/emitter");

// Models
var SongModel = require(__base + "app/models/song");

module.exports = () => {

  return new Promise((resolve, reject) => {

    console.log('--- [GetBestOfAllTime] --- Attempting to get best songs ---');

    // If one or no song in queue
    SongModel.find({ 'votes.legacyScore': { $gt: config.auto.minLegacyScore } }).sort('-votes.legacyScore').exec((err, songs) => {

      if(err){
        console.log('-!- [GetBestOfAllTime:18] -!- An error occured while looking for best songs:\n', err, '\n-!-');
      }

      if(songs && songs.length >= 1){

        var limit = config.auto.maxRandomBestPool;
        if(limit > songs.length){
          limit = songs.length;
        }

        var bestSongsOfAllTime = songs.slice(0, limit);

        console.log('-/- [GetBestOfAllTime] -/- Resolving Promise ( length:', bestSongsOfAllTime.length, '| first:', bestSongsOfAllTime[0].general.title, '| firstIsPlaying:', bestSongsOfAllTime[0].queue.isPlaying, ')');
        resolve(bestSongsOfAllTime);

      }else{

        console.log('-!- [GetBestOfAllTime:48] -!- Promise Rejected: No best song at the time');
        reject('No best songs at the time');

      }

    });

  });

};
