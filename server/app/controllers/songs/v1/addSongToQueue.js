// Packages
require("rootpath")();
var _ = require("lodash");

var path = require('path');
var fs = require('fs');
var fse = require('fs-extra');
var ytdl = require('ytdl-core');
var ffmpeg = require('fluent-ffmpeg');

// Helpers
var EmitHelper = require(__base + "app/helpers/io/emitter");

// Models
var SongModel = require(__base + "app/models/song");
var UserModel = require(__base + "app/models/user");

module.exports = (req, res, done) => {

  console.log('--- [AddSongToQueue] --------------------');

  if(!req.session.isUploading){

    console.log('[AddSongToQueue] Not yet uploading');

    this.profile = req.session.profile;

    SongModel.findOne({ 'general.id': req.body.id, "general.title": req.body.title }, (err, song) => {

      if (err){

        console.log('-!- [AddSongToQueue] Error occured while searching for song: -!-\n', err, '\n-!-');
        res.statusCode = 400;
        return res.json({
          errors: [
            'Could not search for song in db'
          ]
        });

      }

      if (song) { // song exists in db

        console.log('- [AddSongToQueue] Found Song: - \n', song);

        if(song.queue.inQueue){ // song still in queue

          console.log('[AddSongToQueue] Song still in queue');
          this.respondInQueue();

        }else{ // song no longer in queue / downloaded

          if(song.general.isDownloaded){
            console.log('[AddSongToQueue] About to update song in db');
            this.updateInDb(song);
          }else{
            console.log('[AddSongToQueue] About to re-download song');
            this.downloadSong(false, req.body, song); // songIsNew => false => song is already in db
          }

        }

      } else { // create new song to add to queue

        console.log('[AddSongToQueue] About to download song');

        this.downloadSong(true, req.body); // songIsNew => true => song not yet in db

      }

    });

  }else{

    console.log('-!- [AddSongToQueue] Already uploading a song -!-');
    res.statusCode = 412;
    return res.json({
      errors: [
        'Already uploading song'
      ]
    });

  }

  this.downloadSong = (songIsNew, suggestion, song={}) => {

    console.log('- [AddSongToQueue] Creating new song from suggestion -');

    var url = `https://www.youtube.com/watch?v=${suggestion.id}`;
    var tempFolder = `${__base}uploads/temp/`;
    console.log('[AddSongToQueue] Setup folder for temp:', tempFolder);
    var audioFolder = `${__base}uploads/audio/`;
    console.log('[AddSongToQueue] Setup folder for audio:', audioFolder);
    var songTitleStripped = suggestion.title;
    console.log('[AddSongToQueue] Assigned title:', songTitleStripped);
    songTitleStripped = songTitleStripped.replace(/[^a-zA-Z0-9]/g, '');
    console.log('[AddSongToQueue] Stripped title:', songTitleStripped);
    var audioFilename = `${suggestion.id}_${songTitleStripped}.mp4`;
    console.log('[AddSongToQueue] Setup file naming for file:', audioFilename);
    var tempOutput = path.resolve(tempFolder, audioFilename);
    console.log('[AddSongToQueue] Setup file naming for temp:', tempOutput);
    var audioOutput = path.resolve(audioFolder, audioFilename);
    console.log('[AddSongToQueue] Setup file naming for audio:', audioOutput);

    fs.stat(tempOutput, (err, stat) => {

      if(err == null) { // file already exists

        console.log('-!- [AddSongToQueue] File already exists -!-');
        if(!songIsNew){

          song.general.filename = audioFilename;
          this.updateInDb(song);

        }else{

          console.log('-!- [AddSongToQueue] File exists on server, but not in db, weird -!-');
          res.statusCode = 412;
          return res.json({
            errors: [
              'Song exists on server, but not in db, weird...'
            ]
          });

        }

      } else if(err.code == 'ENOENT') { // file doesn't exist

        req.session.isUploading = true;

        console.log('[AddSongToQueue] Attempting to save video as song in: ', req.session.isUploading, tempOutput);

        ytdl(url, { filter: (f) => { return f.container === 'mp4' && !f.encoding; }})
          .on('response', (res) => {
            var totalSize = res.headers['content-length'];
            var dataRead = 0;
            res.on('data', (data) => {
              dataRead += data.length;
              var percent = dataRead / totalSize;
              var strPercent = (percent * 100).toFixed(2) + '%';
              UserModel.findOne({ 'general.email': this.profile.general.email, 'meta.googleId': this.profile.meta.googleId, 'meta.googleAuthToken': this.profile.meta.googleAuthToken }, (err, user) => {
                EmitHelper.emit('DOWNLOAD_PROGRESS', user.meta.socketIds, {percent: percent, str: strPercent});
              });
              process.stdout.cursorTo(0);
              process.stdout.clearLine(1);
              process.stdout.write(strPercent);
            });
            res.on('end', () => {
              process.stdout.write('\n');
              fse.copySync(tempOutput, audioOutput);
              fse.copySync(audioOutput, path.resolve(`${__base}public/assets/audio/`, audioFilename));
              fs.unlinkSync(tempOutput);
              console.log('-f- Finished downloading song to:', audioOutput);
              UserModel.findOne({ 'general.email': this.profile.general.email, 'meta.googleId': this.profile.meta.googleId, 'meta.googleAuthToken': this.profile.meta.googleAuthToken }, (err, user) => {
                EmitHelper.emit('DOWNLOAD_DONE', user.meta.socketIds, {percent: 0});
              });
              suggestion.filename = audioFilename;
              this.finishedDownload(songIsNew, suggestion, song);
            });
          })
          .pipe(fs.createWriteStream(tempOutput))
        ;

      } else { // other error

        console.log('-!- Error occurred while testing audiofile -!-', err.code);

      }

    });

  }

  this.respondInQueue = () => {

    console.log('-!- Song already in queue -!-');
    res.statusCode = 412;
    return res.json({
      errors: [
        'Song already in queue'
      ]
    });

  }

  this.finishedDownload = (songIsNew, suggestion, song) => {

    console.log('[AddSongToQueue] Download finished');

    if(songIsNew){
      this.saveToDb(suggestion);
    }else{
      song.general.filename = suggestion.filename;
      song.general.isDownloaded = true;
      song.general.isFileAboutToBeRemoved = false;
      this.updateInDb(song);
    }

  }

  this.updateInDb = (song) => {

    console.log('[AddSongToQueue] Updating song in db');

    // update last submitter
    song.queue.lastAddedBy.googleId = this.profile.meta.googleId;
    song.queue.lastAddedBy.userName = this.profile.general.fullName;
    song.queue.lastAddedBy.profileImage = this.profile.general.profileImage;
    song.queue.lastAddedBy.added = (new Date()).getTime();

    // reset queue score
    song.queue.votes.currentQueueScore = 0;

    // put back in queue
    song.queue.isPlaying = false;
    song.queue.isVetoed = false;
    song.queue.inQueue = true;

    // Save the song to put back in queue
    return song.save((err) => {

      if (err) {

        console.log('-!- Error occured while updating song: -!-\n', err, '\n-!-');
        res.statusCode = 500;
        return res.json({
          errors: [
            'Could not update song'
          ]
        });

      }

      this.respondSong(song);

    });

  }

  this.saveToDb = (suggestion) => {

    console.log('[AddSongToQueue] Saving song to queue');

    var newSong = new SongModel();

    // -- file settings --------
    console.log('Adding filename');
    newSong.general.filename = suggestion.filename;

    console.log('Setting downloaded');
    newSong.general.isDownloaded = true;

    console.log('Setting file about to be removed');
    newSong.general.isFileAboutToBeRemoved = false;

    // -- general info ---------
    console.log('Adding youtube id');
    newSong.general.id = suggestion.id;

    console.log('Adding youtube title');
    newSong.general.title = suggestion.title;

    console.log('Adding youtube channel');
    newSong.general.channel = suggestion.channel;

    console.log('Adding youtube duration');
    newSong.general.duration = suggestion.duration;

    // -- queue info ------------
    console.log('Setting user to original uploader');
    newSong.queue.originallyAddedBy.googleId = this.profile.meta.googleId;
    newSong.queue.originallyAddedBy.userName = this.profile.general.fullName;
    newSong.queue.originallyAddedBy.profileImage = this.profile.general.profileImage;
    newSong.queue.originallyAddedBy.added = (new Date()).getTime();
    newSong.queue.lastAddedBy = newSong.queue.originallyAddedBy;

    console.log('Setting votes to default values');
    newSong.queue.votes.legacyScore = 0;
    newSong.queue.votes.currentQueueScore = 0;

    // -- thumbs info ---------
    console.log('Adding thumbnails');
    newSong.thumbs = suggestion.thumbs;

    // -- Save to queue / db --
    console.log('Setting vetoed');
    newSong.queue.isPlaying = false;

    // -- Save to queue / db --
    console.log('Setting vetoed');
    newSong.queue.isVetoed = false;

    // -- Save to queue / db --
    console.log('Adding to queue');
    newSong.queue.inQueue = true;

    // Save the song to put back in queue
    return newSong.save((err) => {

      if (err) {

        console.log('-!- Error occured while saving new song: -!-\n', err, '\n-!-');
        res.statusCode = 400;
        return res.json({
          errors: [
            'Could not save song'
          ]
        });

      }

      this.respondSong(newSong);

    });

  }

  this.respondSong = (song) => {

    req.session.isUploading = false;

    console.log('Broadcasting for update');
    EmitHelper.broadcast('QUEUE_UPDATED', song);

    console.log('- New song added to queue -');
    res.statusCode = 200;
    return res.json(song);

  }

};
