// Packages
require("rootpath")();
var _ = require("lodash");
var path = require('path');

// Helpers
var SongHelper = require(__base + "app/controllers/songs/v1/helpers");
var EmitHelper = require(__base + "app/helpers/io/emitter");

// Models
var SongModel = require(__base + "app/models/song");
var UserModel = require(__base + "app/models/user");

module.exports = (req, res, done) => {

  console.log('--- [AddSongToQueue] --- Attempting to add song to queue ---');

  if(!req.session.isUploading){

    console.log('[AddSongToQueue:24] Not yet uploading');

    this.profile = req.session.profile;

    SongModel.findOne({ 'general.id': req.body.id, "general.title": req.body.title }, (err, song) => {

      if (err){

        console.log('-!- [AddSongToQueue:32] -!- Error occured while searching for song:\n', err, '\n-!-');
        res.statusCode = 400;
        return res.json({ errors: [ 'Could not search for song in db' ] });

      }

      if (song) { // song exists in db

        console.log('[AddSongToQueue:41] Found Song:', song.general.title);

        if(song.queue.inQueue){ // song still in queue

          console.log('[AddSongToQueue:45] Song still in queue');
          this.respondInQueue();

        }else{ // song no longer in queue / downloaded

          if(song.audio.isDownloaded){
            console.log('[AddSongToQueue:51] About to update song in db');
            this.updateInDb(song);
          }else{
            console.log('[AddSongToQueue:54] About to re-download song');
            this.downloadSong(false, req.body, song); // songIsNew => false => song is already in db
          }

        }

      } else { // create new song to add to queue

        console.log('[AddSongToQueue:62] About to download song');

        this.preDownloadSong(true, req.body); // songIsNew => true => song not yet in db

      }

    });

  }else{

    console.log('-!- [AddSongToQueue:72] -!- Already uploading a song');
    res.statusCode = 412;
    return res.json({ errors: [ 'Already uploading song' ] });

  }

  this.getAudioFilename = (songId, songTitle) => {

    var songTitleStripped = songTitle;
    songTitleStripped = songTitleStripped.replace(/[^a-zA-Z0-9]/g, '');
    var audioFilename = `${songId}_${songTitleStripped}.mp4`;

    console.log('[AddSongToQueue] Setup file naming for file:', audioFilename);
    return audioFilename;

  }

  this.preDownloadSong = (songIsNew, suggestion) => {

    var newSong = new SongModel();

    // -- file settings --------
    newSong.audio.filename = this.getAudioFilename(suggestion.id, suggestion.title);
    newSong.audio.fileId = ''; // placeholder till real download is done
    newSong.audio.isDownloaded = true; // pretend it's already downloaded to avoid double additions while still downloading
    newSong.audio.scheduledForRemoval = false;

    // -- wave settings --------
    newSong.waveform.barsSaved = false;
    newSong.waveform.waveSaved = false;

    // -- general info ---------
    newSong.general.id = suggestion.id;
    newSong.general.title = suggestion.title;
    newSong.general.channel = suggestion.channel;
    newSong.general.duration = suggestion.duration;

    // -- queue info ------------
    newSong.queue.originallyAddedBy.googleId = this.profile.meta.googleId;
    newSong.queue.originallyAddedBy.userName = this.profile.general.fullName;
    newSong.queue.originallyAddedBy.profileImage = this.profile.general.profileImage;
    newSong.queue.originallyAddedBy.added = (new Date()).getTime();
    newSong.queue.lastAddedBy = newSong.queue.originallyAddedBy;
    newSong.votes.legacyScore = 0;
    newSong.votes.currentQueueScore = 0;

    // -- thumbs info ---------
    newSong.thumbs = suggestion.thumbs;

    // -- Save to queue / db --
    newSong.queue.isPlaying = false;
    newSong.queue.isVetoed = false;
    newSong.queue.inQueue = false;

    // Save the song to put back in queue
    return newSong.save((err) => {

      if (err) {

        console.log('-!- [AddSongToQueue:115] -!- Error occured while saving new song:\n', err, '\n-!-');
        res.statusCode = 400;
        return res.json({ errors: [ 'Could not save song' ] });

      }

      this.downloadSong(false, suggestion, newSong);

    });



  }

  this.downloadSong = (songIsNew, suggestion, song) => {

    if(typeof(song) === 'undefined') song = {};

    console.log('-?- [AddSongToQueue:87] -?- Downloading song from suggestion');

    req.session.isUploading = true;

    UserModel.findOne({ 'general.email': this.profile.general.email, 'meta.googleId': this.profile.meta.googleId, 'meta.googleAuthToken': this.profile.meta.googleAuthToken }, (err, user) => {

      SongHelper.downloadSong(suggestion.id, song.audio.filename, true, user.meta.socketIds).then((fileData) => {

        console.log('[AddSongToQueue] Song Downloaded:', fileData.fileId, fileData.filename);

        suggestion.filename = fileData.filename;
        suggestion.fileId = fileData.fileId;

        this.finishedDownload(songIsNew, suggestion, song);

      }, (error) => {

        console.log('-!- [AddSongToQueue] -!- YOUTUBE DOWNLOAD FAILED:', error);
        res.statusCode = 500;
        return res.json({ errors: [ 'Song upload failed' ] });

      });

    });

  }

  this.respondInQueue = () => {

    console.log('-!- [AddSongToQueue:176] -!- Song already in queue');
    res.statusCode = 412;
    return res.json({ errors: [ 'Song already in queue' ] });

  }

  this.finishedDownload = (songIsNew, suggestion, song) => {

    console.log('[AddSongToQueue:188] Download finished');

    if(songIsNew){
      this.saveToDb(suggestion);
    }else{
      song.audio.filename = suggestion.filename;
      song.audio.fileId = suggestion.fileId;
      song.audio.isDownloaded = true;
      song.audio.scheduledForRemoval = false;
      this.updateInDb(song);
    }

  }

  this.updateInDb = (song) => {

    console.log('[AddSongToQueue:188] Updating song in db');

    // update last submitter
    song.queue.lastAddedBy.googleId = this.profile.meta.googleId;
    song.queue.lastAddedBy.userName = this.profile.general.fullName;
    song.queue.lastAddedBy.profileImage = this.profile.general.profileImage;
    song.queue.lastAddedBy.added = (new Date()).getTime();

    // reset queue score
    song.votes.currentQueueScore = 0;

    // put back in queue
    song.queue.isPlaying = false;
    song.queue.isVetoed = false;
    song.queue.inQueue = true;

    // Save the song to put back in queue
    return song.save((err) => {

      if (err) {

        console.log('-!- [AddSongToQueue:209] -!- Error occured while updating song:\n', err, '\n-!-');
        res.statusCode = 500;
        return res.json({ errors: [ 'Could not update song' ] });

      }

      this.checkSong(song);

    });

  }

  this.checkSong = (song) => {

    req.session.isUploading = false;

    SongHelper.getCurrentQueue().then((currentQueue) => {

      if(currentQueue.length === 1 && !currentQueue[0].queue.isPlaying){

        console.log('[AddSongToQueue:305] No song playing yet, setting this song as playing');

        SongModel.findOne({'queue.inQueue': true}).exec((err, song) => {

          if(err){ console.log('[AddSongToQueue:310] Err:', err); }

          if(song){

            currentQueue[0].queue.isPlaying = true;
            song.queue.isPlaying = true;

            song.save((err) => {

              if (err) {

                console.log('-!- [AddSongToQueue:298] -!- Error occured while saving first song:\n', err, '\n-!-');
                res.statusCode = 400;
                return res.json({ errors: [ 'Could not save song' ] });

              }else{

                console.log('[AddSongToQueue:304] Returning updated first song:', song.general.title);
                this.respondSong(currentQueue, song);

              }

            });

          }

        });

      }else{

        this.respondSong(currentQueue, song);

      }

    }, (failData) => {

      console.log('-!- [AddSongToQueue:315] -!- Something went wrong while adding new song');
      res.statusCode = 400;
      return res.json({ errors: [ 'Something went wrong' ] });

    });

  }

  this.respondSong = (currentQueue, song) => {

    currentQueue.sort((song1, song2) => {

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

    console.log('-e- [AddSongToQueue] -e- Broadcasting for update (length:', currentQueue.length, ')');
    EmitHelper.broadcast('QUEUE_UPDATED', currentQueue);

    console.log('-/- [AddSongToQueue] -/- New song added to queue');
    res.setHeader('Last-Modified', (new Date()).toUTCString());
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", 0);
    res.statusCode = 200;
    return res.json(song);

  }

};
