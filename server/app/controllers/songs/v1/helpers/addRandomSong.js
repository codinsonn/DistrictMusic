// Packages
require("rootpath")();
var _ = require("lodash");
var path = require('path');

// Config
var config = require(__base + "config");

// Helpers
var EmitHelper = require(__base + "app/helpers/io/emitter");
var SongHelper = require(__base + "app/controllers/songs/v1/helpers");

// Models
var SongModel = require(__base + "app/models/song");

module.exports = (setPlaying) => {

  if(typeof(setPlaying) === 'undefined') setPlaying = false;

  console.log('--- [AddRandomSong] --- Attempting to re add random song to queue with ( minLegacyScore:', config.auto.minLegacyScore, ') ---');

  this.setPlaying = setPlaying;

  this.init = () => {

    console.log('[AddRandomSong:28] Initialising... (checking songs)');

    var query = { 'audio.audioRemovable': false };

    // Find fetch list of songs that definitely still have their audio files on server
    SongModel.find(query).sort('-votes.legacyScore').exec((err, songs) => {

      if(err){ console.log('-!- [AddRandomSong:37] -!- An error occured while searching for random song: \n', err, '\n-!-'); }

      if(songs && songs.length >= 1){

        console.log('[AddRandomSong:42] Found unqueued songs!');

        var limit = config.auto.maxRandomBestPool;
        if(limit > songs.length){
          limit = songs.length;
        }
        var rand = Math.floor(Math.random() * limit);
        var randomSong = songs[rand];

        console.log('[AddRandomSong:46] Attempting to update random song, skipping', rand, 'songs');

        // Requeue random unqueued song from list of best of all times
        SongModel.findOne({ 'general.id': randomSong.general.id, 'general.title': randomSong.general.title }).exec((err, song) => {

          console.log('[AddRandomSong:51] Query Finished!');

          if (err) {
            console.log('-!- [AddRandomSong:54] -!- An error occured while queueing random song: \n', err, '\n-!-');
          }

          if (song) {

            console.log('[AddRandomSong:59] Found random song:', song.general.title);

            if(song.audio.isDownloaded){
              this.saveSong(song);
            }else{
              this.downloadSong(song);
            }

          }else{

            console.log('-!- [AddRandomSong:69] -!- No suitable random song found');

          }

        });

      }else{

        console.log('-!- [AddRandomSong:77] -!- No suitable songs to add back to queue');

      }

    });

  }

  this.downloadSong = (song) => {

    console.log('[AddRandomSong:87] Attempting to download song:', song.general.title);

    SongHelper.downloadSong(song.general.id, song.general.title).then((fileData) => {

      console.log('[AddRandomSong:95] Song Downloaded:', fileData.fileId, fileData.filename);

      song.audio.filename = fileData.filename;
      song.audio.fileId = fileData.fileId;
      song.audio.isDownloaded = true;

      this.saveSong(song);

    }, (error) => {

      console.log('-!- [AddRandomSong:105] -!- YOUTUBE DOWNLOAD FAILED:', error);

    });

  }

  this.saveSong = (song) => {

    console.log('[AddRandomSong:149] Attempting to save song back to queue ...');

    song.audio.isDownloaded = true;
    song.audio.scheduledForRemoval = false;
    song.votes.currentQueueScore = 0;
    song.queue.lastAddedBy.googleId = 'cronbot';
    song.queue.lastAddedBy.userName = 'cronbot';
    song.queue.lastAddedBy.profileImage = '/assets/img/defaultProfile.png';
    song.queue.lastAddedBy.added = (new Date()).getTime();
    song.queue.isPlaying = this.setPlaying;
    song.queue.isVetoed = false;
    song.queue.inQueue = true;

    return song.save((err) => {

      if (err) {
        console.log('-!- [AddRandomSong:165] -!- Error occured while updating song: \n', err, '\n-!-');
      } else {
        console.log('-e- [AddRandomSong:167] -e- About to emit for update');
        this.emitCurrentQueue();
        console.log('[AddRandomSong:169] Cronbot added', song.general.title, 'to the queue!');
      }

    });

  }

  this.emitCurrentQueue = () => {

    var SongHelper = require(__base + "app/controllers/songs/v1/helpers");
    SongHelper.getCurrentQueue().then((currentQueue) => {
      console.log('-/- [AddRandomSong] -/- Broadcasting for queue update (length:', currentQueue.length, ')');
      EmitHelper.broadcast('QUEUE_UPDATED', currentQueue);
    }, (failData) => {
      console.log('-!- [AddRandomSong:182] -!- Queue fetch failed:', failData);
    });

  }

  this.init();

};
