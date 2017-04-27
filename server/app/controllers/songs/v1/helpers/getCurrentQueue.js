// Packages
var _ = require("lodash");
require("rootpath")();

// Helpers
var EmitHelper = require(__base + "app/helpers/io/emitter");

// Models
var SongModel = require(__base + "app/models/song");

module.exports = () => new Promise((resolve, reject) => {

  //console.log('--- [GetCurrentQueue] --- Attempting to get all queued songs ---');

  // If one or no song in queue
  SongModel.find({'queue.inQueue': true, 'audio.isDownloaded': true}).sort('-votes.currentQueueScore').exec((err, songs) => {

    if(err){
      console.log('-!- [GetCurrentQueue:18] -!- An error occured while checking the current queue:\n', err, '\n-!-');
    }

    if(songs && songs.length >= 1){

      songs.sort((song1, song2) => {

        var s1 = 0;
        if(song1.queue.isPlaying) s1 = 20; // don't skip the song currently playing
        if(song1.queue.isVetoed) s1 += 10; // sort by veto
        if(song1.votes.currentQueueScore > song2.votes.currentQueueScore) s1 += 5; // sort by current score
        if(!song1.queue.isVetoed && song1.votes.legacyScore > song2.votes.legacyScore) s1 += 3; // sort by legacy score
        if(song1.queue.lastAddedBy.added < song2.queue.lastAddedBy.added) s1++; // sort by date added

        var s2 = 0;
        if(song2.queue.isPlaying) s2 = 20; // don't skip the song currently playing
        if(song2.queue.isVetoed) s2 += 10;
        if(song2.votes.currentQueueScore > song1.votes.currentQueueScore) s2 += 5;
        if(!song2.queue.isVetoed && song2.votes.legacyScore > song1.votes.legacyScore) s2 += 3;
        if(song2.queue.lastAddedBy.added < song1.queue.lastAddedBy.added) s2++;

        return s2 - s1;

      });

      //console.log('-/- [GetCurrentQueue] -/- Resolving Promise ( length:', songs.length, '| first:', songs[0].general.title, '| firstIsPlaying:', songs[0].queue.isPlaying, ')');
      resolve(songs);

    }else{

      console.log('-!- [GetCurrentQueue:48] -!- Promise Rejected: No songs in queue');
      reject('No songs in queue');

    }

  });

});
