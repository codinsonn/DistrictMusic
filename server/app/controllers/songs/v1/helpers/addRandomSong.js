// Packages
require("rootpath")();
var _ = require("lodash");
var path = require('path');
var fs = require('fs');
var fse = require('fs-extra');
var ytdl = require('ytdl-core');
var ffmpeg = require('fluent-ffmpeg');

// Config
var config = require(__base + "config");

// Helpers
var EmitHelper = require(__base + "app/helpers/io/emitter");
var SongHelper = require(__base + "app/controllers/songs/v1/helpers");

// Models
var SongModel = require(__base + "app/models/vote");

module.exports = (setPlaying=false) => {

  console.log('--- [AddRandomSong] --- Attempting to re add random song to queue with ( minLegacyScore:', config.auto.minLegacyScore, ') ---');

  this.setPlaying = setPlaying;

  this.init = () => {

    console.log('[AddRandomSong:28] Initialising... (checking songs)');

    var query = { 'queue.inQueue': false, 'queue.votes.legacyScore': { $gt: config.auto.minLegacyScore } };

    // Find random unqueued song with legacy score greater than 10
    SongModel.find(query).exec((err, songs) => {

      if(err){
        console.log('-!- [AddRandomSong:37] -!- An error occured while searching for random song: \n', err, '\n-!-');
      }

      if(songs && songs.length >= 1){

        console.log('[AddRandomSong:42] Found unqueued songs!', songs.length, songs);

        var rand = Math.floor(Math.random() * songs.length);

        console.log('[AddRandomSong:46] Attempting to update random song, skipping:', rand);

        // Requeue random unqueued song
        SongModel.findOne(query).skip(rand).exec((err, song) => {

          console.log('[AddRandomSong:51] Query Finished!');

          if (err) {
            console.log('-!- [AddRandomSong:54] -!- An error occured while queueing random song: \n', err, '\n-!-');
          }

          if (song) {

            console.log('[AddRandomSong:59] Found random song:', song.general.title);

            if(song.general.isDownloaded){
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

    var url = `https://www.youtube.com/watch?v=${song.general.id}`;
    var tempFolder = `${__base}uploads/temp/`;
    var audioFolder = `${__base}uploads/audio/`;
    var songTitleStripped = song.general.title;
    songTitleStripped = songTitleStripped.replace(/[^a-zA-Z0-9]/g, '');
    var audioFilename = `${song.general.id}_${songTitleStripped}.mp4`;
    var tempOutput = path.resolve(tempFolder, audioFilename);
    var audioOutput = path.resolve(audioFolder, audioFilename);

    fs.stat(tempOutput, (err, stat) => {

      if(err == null) { // file already exists

        console.log('-!- [AddRandomSong:102] -!- File already exists');
        song.general.filename = audioFilename;
        song.general.isDownloaded = true;
        this.saveSong(song);

      } else if(err.code == 'ENOENT') { // file doesn't exist

        console.log('[AddRandomSong:109] Attempting to save video as song in: ', tempOutput);

        ytdl(url, { filter: (f) => { return f.container === 'mp4' && !f.encoding; }})
          .on('response', (res) => {
            var totalSize = res.headers['content-length'];
            var dataRead = 0;
            res.on('data', (data) => {
              dataRead += data.length;
              var percent = dataRead / totalSize;
              var strPercent = (percent * 100).toFixed(2) + '%';
              process.stdout.cursorTo(0);
              process.stdout.clearLine(1);
              process.stdout.write(strPercent);
            });
            res.on('end', () => {
              process.stdout.write('\n');
              fse.copySync(tempOutput, audioOutput);
              fse.copySync(audioOutput, path.resolve(`${__base}public/assets/audio/`, audioFilename));
              fs.unlinkSync(tempOutput);
              console.log('-f- [AddRandomSong:127] -f- Finished downloading song to:', audioOutput);
              song.general.filename = audioFilename;
              song.general.isDownloaded = true;
              this.saveSong(song);
            });
          })
          .pipe(fs.createWriteStream(tempOutput))
        ;

      } else { // other error

        console.log('-!- [AddRandomSong:139] -!- Error occurred while testing audiofile', err.code);

      }

    });

  }

  this.saveSong = (song) => {

    console.log('[AddRandomSong:149] Attempting to save song back to queue ...');

    song.general.isDownloaded = true;
    song.general.isFileAboutToBeRemoved = false;
    song.queue.votes.currentQueueScore = 0;
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

    SongHelper.getCurrentQueue().then((currentQueue) => {
      console.log('-/- [AddRandomSong] -/- Broadcasting for queue update (length:', currentQueue.length, ')');
      EmitHelper.broadcast('QUEUE_UPDATED', currentQueue);
    }, (failData) => {
      console.log('-!- [AddRandomSong:182] -!- Queue fetch failed:', failData);
    });

  }

  this.init();

};
