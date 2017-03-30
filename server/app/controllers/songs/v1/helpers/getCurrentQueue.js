// Packages
require("rootpath")();

// Helpers
var EmitHelper = require(__base + "app/helpers/io/emitter");

// Models
var SongModel = require(__base + "app/models/song");

module.exports = new Promise((resolve, reject) => {

  // If one or no song in queue
  SongModel.find({'queue.inQueue': true, 'general.isDownloaded': true}).sort('-queue.votes.currentQueueScore').exec((err, songs) => {

    if(err){
      console.log('-!- [CRON] An error occured while checking the current queue -!-\n', err, '\n-!-');
    }

    if(songs){

      songs.sort((song1, song2) => {

        var s1 = 0;
        if(song1.queue.isPlaying) s1 = 20; // don't skip the song currently playing
        if(song1.queue.isVetoed) s1 += 10; // sort by veto
        if(song1.queue.votes.currentQueueScore > song2.queue.votes.currentQueueScore) s1 += 5; // sort by current score
        if(!song1.queue.isVetoed && song1.queue.votes.legacyScore > song2.queue.votes.legacyScore) s1 += 3; // sort by legacy score
        if(song1.queue.lastAddedBy.added < song2.queue.lastAddedBy.added) s1++; // sort by date added

        var s2 = 0;
        if(song2.queue.isPlaying) s2 = 20; // don't skip the song currently playing
        if(song2.queue.isVetoed) s2 += 10;
        if(song2.queue.votes.currentQueueScore > song1.queue.votes.currentQueueScore) s2 += 5;
        if(!song2.queue.isVetoed && song2.queue.votes.legacyScore > song1.queue.votes.legacyScore) s2 += 3;
        if(song2.queue.lastAddedBy.added < song1.queue.lastAddedBy.added) s2++;

        return s2 - s1;

      });

      if(!songs[0].queue.isPlaying){

        console.log('[GetAllQueued] Set as playing:', songs[0].general.title);
        songs[0].queue.isPlaying = true;
        var firstsong = songs[0];
        SongModel.update(
          {'general.id': firstsong.general.id},
          {'queue.isPlaying': true}, {}, () => {
            console.log('[GetAllQueued] Updated playing song');
            resolve(songs);
          }
        );

      }else if(songs[1] && songs[1].queue.isPlaying){

        console.log('[GetAllQueued] Second song also playing? >', songs[1].general.title);
        songs[1].queue.isPlaying = false;
        var secondSong = songs[1];
        SongModel.update(
          {'general.id': secondSong.general.id},
          {'queue.isPlaying': false}, {}, () => {
            console.log('[GetAllQueued] Updated second song');
            resolve(songs);
          }
        );

      }else{

        console.log('[GetAllQueued] First song playing:', songs[0].queue.isPlaying, 'SecondSongPlaying:', songs[1].queue.isPlaying);
        resolve(songs);

      }

    }else{

      reject('No songs in queue');

    }

  });

});
