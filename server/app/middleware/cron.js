// Config
var config = require(__base + "config");

// Packages
var _ = require("lodash");
var CronJob = require('cron').CronJob;
var path = require('path');

// Helpers
var EmitHelper = require(__base + "app/helpers/io/emitter");
var SongHelper = require(__base + "app/controllers/songs/v1/helpers");

// Models
var UserModel = require(__base + "app/models/user");
var SongModel = require(__base + "app/models/song");
var SpeakerModel = require(__base + "app/models/speaker");

module.exports = function(timeZone) {

  //var everyMinute = '00 * * * * 1-60'; // testing
  //var everyHourAtTheFirstMinute = '00 01 * * * 1-24'; // testing
  //var everyHourAtTheLastMinute = '00 59 * * * 1-24'; // testing
  //var everyHour = '00 00 * * * 1-24'; // testing
  //var everyWeekdayInTheMorning = '00 00 09 * * 1-5';
  //var everyMondayMorning = '00 00 09 * * 1';
  //var everySundayNight = '00 00 23 * * 7';

  /* --- Functions ----------------------------------------------------------------------------------------- */

  this.emitSpeakerQueueUpdate = (currentQueue) => {

    currentQueue.sort((song1, song2) => {

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

    SpeakerModel.findOne().exec((err, speaker) => {

      if(speaker && speaker.meta.socketIds.length >= 1){
        EmitHelper.emit('CHECK_SPEAKER_QUEUE', speaker.meta.socketIds, currentQueue);
      }

    });

  }

  this.emitCurrentQueue = () => {

    SongHelper.getCurrentQueue().then((currentQueue) => {
      console.log('-e- [CRON:65] -e- Broadcasting for queue update ( length:', currentQueue.length, ')');
      EmitHelper.broadcast('QUEUE_UPDATED', currentQueue);
    }, (failData) => {
      console.log('[CRON:68] Queue fetch failed:', failData);
    });

  }

  /* --- Every Ten Seconds: Check if speaker queue is up to date -------------------------------------------- */

  this.cronCheckSpeakerQueueUpdate = new CronJob(config.auto.cronPatternCheckSpeakerQueueUpdate, () => {

    console.log('-CRON- Emitting for speaker queue update -CRON-');

      // If one or no songs in queue
      SongModel.find().where('queue.inQueue').equals(true).exec((err, songs) => {

        if(err){
          console.log('-!- [CRON:83] An error occured while checking the current queue for speaker -!-\n', err, '\n-!-');
        }

        if(songs){

          console.log('[CRON:88] About to check speaker queue ...');
          this.emitSpeakerQueueUpdate(songs);

        }

      });

    }, () => { // Callback after job is done

      console.log('-/CRON/- Finished emitting speaker queue update -/CRON/-');

    },
    true, // Start the job right now
    timeZone // Time zone of this job

  );

  /* --- Every Minute: Check if songs need to be added to queue -------------------------------------------- */

  this.cronCheckQueueEmpty = new CronJob(config.auto.cronPatternCheckQueueEmpty, () => {

    console.log('-CRON- Checking if queue is empty -CRON-');

      // If one or no song in queue
      SongModel.find().where('queue.inQueue').equals(true).exec((err, songs) => {

        if(err){
          console.log('-!- [CRON:115] An error occured while checking the current queue -!-\n', err, '\n-!-');
        }

        if(songs && songs.length < config.auto.minSongsInQueue){

          console.log('[CRON:120] About to add random song to queue... ( minSongsInQueue:', config.auto.minSongsInQueue, ')');
          SongHelper.addRandomSong();

        }else{

          console.log('[CRON:125] Queue has', songs.length, 'songs in queue, emitting for mandatory update');
          this.emitCurrentQueue();

        }

      });

    }, () => { // Callback after job is done

      console.log('-/CRON/- Finished checking if queue is empty -/CRON/-');

    },
    true, // Start the job right now
    timeZone // Time zone of this job

  );

  /* --- Daily: Add random song to queue -------------------------------------------- */

  this.cronAddRandomSong = new CronJob(config.auto.cronPatternAddRandomSong, () => {

    console.log('-CRON- Adding random song to queue -CRON-');

      //this.addRandomSongToQueue();
      SongHelper.addRandomSong();

    }, () => { // Callback after job is done

      console.log('-/CRON/- Finished adding random song to queue -/CRON/-');

    },
    true, // Start the job right now
    timeZone // Time zone of this job

  );

  /* --- Weekly: Reset Veto & Super Votes ------------------------------------------------------------------ */

  this.cronResetVotes = new CronJob(config.auto.cronPatternResetVotes, () => {

    console.log('-CRON- Resetting weekly special votes -CRON-');

      var conditions = {};
      var query = { permissions: { vetosLeft: config.auto.resetVetos, superVotesLeft: config.auto.resetSuperVotes } };
      var options = {};

      UserModel.update(conditions, query, options, () => {

        console.log('-!- [CRON:173] Vetos Reset -!-');
        EmitHelper.broadcast('USER_PROFILE_CHANGED');
        console.log('-!- [CRON:175] Super Votes Reset -!-');

      });

    }, () => { // Callback after job is done

      console.log('-/CRON/- Finished resetting weekly special votes -/CRON/-');

    },
    true, // Start the job right now
    timeZone // Time zone of this job

  );

  /* --- Weekly: Schedule unqueued files for removal ----------------------------------------------------------- */

  this.cronScheduleFilesToBeRemoved = new CronJob(config.auto.cronPatternScheduleFilesToBeRemoved, () => {

    console.log('-CRON- Scheduling files for removal -CRON-');

      var updateConditions = { 'queue.inQueue': false, 'general.isDownloaded': true, 'general.isFileAboutToBeRemoved': false };
      var updateQuery = { 'general.isFileAboutToBeRemoved': true };
      var updateOptions = {};

      SongModel.update(updateConditions, updateQuery, updateOptions, () => {

        console.log('-!- [CRON:201] Files scheduled for removal -!-');

      });

    }, () => { // Callback after job is done

      console.log('-/CRON/- Finished scheduling files for removal -/CRON/-');

    },
    true, // Start the job right now
    timeZone // Time zone of this job

  );

  /* --- Weekly: Reset 'isDownloaded' for files scheduled for removal  ---------------------------------------------------------- */

  this.cronRemoveScheduledFilesInDb = new CronJob(config.auto.cronPatternRemoveScheduledFiles, () => {

    console.log('-CRON- Removing files scheduled for removal -CRON-');

      var removeConditions = { 'queue.inQueue': false, 'general.isFileAboutToBeRemoved': true };
      var removeQuery = { 'general.isDownloaded': false, 'general.isFileAboutToBeRemoved': false };
      var removeOptions = {};

      /*SongModel.find(removeConditions).exec((err, songs) => {

        if(err){
          console.log('-!- [CRON:228] An error occured while removing files -!-\n', err, '\n-!-');
        }

        if(songs){

          console.log('-?- [CRON:233] Songs to be removed: ', songs.length,' -?-');

          _.forEach(songs, (song) => {

            var audioFilename = song.general.filename;

            var uploadsFolder = `${__base}uploads/audio/`;
            var uploadedFilePath = path.resolve(uploadsFolder, audioFilename);

            var publicFolder = `${__base}public/assets/audio/`;
            var publicFilePath = path.resolve(publicFolder, audioFilename);

            fs.unlinkSync(uploadedFilePath);
            fs.unlinkSync(publicFilePath);

            console.log('[CRON] Removed file:', publicFilePath);
            EmitHelper.broadcast('USER_PROFILE_CHANGED');

          });

        }

      });*/

      SongModel.update(removeConditions, removeQuery, removeOptions, () => {

        console.log('-!- [CRON:259] Files removed -!-');
        //this.emitCurrentQueue();

      });

    }, () => { // Callback after job is done

      console.log('-/CRON/- Finished removing files scheduled for removal -/CRON/-');

    },
    true, // Start the job right now
    timeZone // Time zone of this job

  );

/* --- Weekly: Remove unused audio files  ---------------------------------------------------------- */

  this.cronRemoveUnusedFiles = new CronJob(config.auto.cronPatternRemoveUnusedFiles, () => {

    console.log('-CRON- Removing files scheduled for removal -CRON-');

      var removeConditions = { 'queue.inQueue': false, 'general.isDownloaded': false };

      SongModel.find(removeConditions).exec((err, songs) => {

        if(err){
          console.log('-!- [CRON:287] An error occured while removing files -!-\n', err, '\n-!-');
        }

        if(songs){

          console.log('-?- [CRON:292] Songs to be checked for removal: ', songs.length,' -?-');



          _.forEach(songs, (song) => {

            var audioFilename = song.general.filename;

            var uploadsFolder = `${__base}uploads/audio/`;
            var uploadedFilePath = path.resolve(uploadsFolder, audioFilename);

            var publicFolder = `${__base}public/assets/audio/`;
            var publicFilePath = path.resolve(publicFolder, audioFilename);

            // Check in public/assets/audio folder and remove if found
            fs.stat(uploadedFilePath, (err, stat) => {

              if(err == null) { // file exists on server

                console.log('-!- [CRON:310] -!- File already exists');
                fs.unlinkSync(uploadedFilePath);
                console.log('[CRON] Removed file:', uploadedFilePath);

              } else if(err.code == 'ENOENT') { // file doesn't exist on server
                // Do nothing
              } else { // other error
                console.log('-!- [CRON:342] -!- Error occurred while testing audiofile', err.code);
              }

            });

            // Check in uploads folder and remove if found
            fs.stat(uploadedFilePath, (err, stat) => {

              if(err == null) { // file exists on server

                console.log('-!- [CRON:327] -!- File already exists');
                fs.unlinkSync(publicFilePath);
                console.log('[CRON] Removed file:', publicFilePath);

              } else if(err.code == 'ENOENT') { // file doesn't exist on server
                // Do nothing
              } else { // other error
                console.log('-!- [CRON:342] -!- Error occurred while testing audiofile', err.code);
              }

            });

          });

        }

      });

    }, () => { // Callback after job is done

      console.log('-/CRON/- Finished removing unused audio files -/CRON/-');

    },
    true, // Start the job right now
    timeZone // Time zone of this job

  );

};

