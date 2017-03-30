// Config
var config = require(__base + "config");

// Packages
var _ = require("lodash");
var CronJob = require('cron').CronJob;
var path = require('path');
var fs = require('fs');
var fse = require('fs-extra');
var ytdl = require('ytdl-core');
var ffmpeg = require('fluent-ffmpeg');

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

  this.addRandomSongToQueue = () => {

    var query = { 'queue.inQueue': false, 'queue.votes.legacyScore': { $gt: config.auto.minLegacyScore } };

    // Find random unqueued song with legacy score greater than 10
    SongModel.find(query).exec((err, unqueuedSongs) => {

      if(err){
        console.log('-!- [CRONBOT] An error occured while searching for random song -!-\n', err, '\n-!-');
      }

      if(unqueuedSongs){

        var rand = Math.floor(Math.random() * unqueuedSongs.length);

        // Requeue random unqueued song
        SongModel.findOne(query).skip(rand).exec((err, song) => {

          if(err){
            console.log('-!- [CRONBOT] An error occured while queueing random song -!-\n', err, '\n-!-');
          }

          if(song){

            if(song.general.isDownloaded){
              this.saveSong(song);
            }else{
              this.downloadSong(song);
            }

          }

        });

      }

    });

  }

  this.downloadSong = (song) => {

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

        console.log('-!- [CRONBOT] File already exists -!-');
        song.general.filename = audioFilename;
        song.general.isDownloaded = true;
        this.saveSong(song);

      } else if(err.code == 'ENOENT') { // file doesn't exist

        console.log('[CRONBOT] Attempting to save video as song in: ', tempOutput);

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
              console.log('-f- Finished downloading song to:', audioOutput);
              song.general.filename = audioFilename;
              song.general.isDownloaded = true;
              this.saveSong(song);
            });
          })
          .pipe(fs.createWriteStream(tempOutput))
        ;

      } else { // other error

        console.log('-!- [CRONBOT] Error occurred while testing audiofile -!-', err.code);

      }

    });

  }

  this.saveSong = (song) => {

    song.general.isDownloaded = true;
    song.general.isFileAboutToBeRemoved = false;
    song.queue.votes.currentQueueScore = 0;
    song.queue.lastAddedBy.googleId = 'cronbot';
    song.queue.lastAddedBy.userName = 'cronbot';
    song.queue.lastAddedBy.profileImage = '/assets/img/defaultProfile.png';
    song.queue.lastAddedBy.added = (new Date()).getTime();
    song.queue.isPlaying = false;
    song.queue.isVetoed = false;
    song.queue.inQueue = true;

    return song.save((err) => {

      if (err) {
        console.log('-!- Error occured while updating song: -!-\n', err, '\n-!-');
      } else {
        console.log('[CRONBOT] About to emit for update');
        this.emitCurrentQueue();
        console.log('[CRONBOT] Cronbot added', song.general.title, 'to the queue and emitted!');
      }

    });

  }

  this.checkSpeakerQueue = (currentQueue) => {

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

    SongHelper.getCurrentQueue.then((currentQueue) => {
      console.log('- [CRON] Broadcasting for queue update -');
      EmitHelper.broadcast('QUEUE_UPDATED', currentQueue);
    }, (failData) => {
      console.log('[CRON] Queue fetch failed:', failData);
    });

  }

  /* --- Every Ten Seconds: Check if speaker queue is up to date -------------------------------------------- */

  this.cronCheckSpeakerQueueUpdate = new CronJob(config.auto.cronPatternCheckSpeakerQueueUpdate, () => {

    console.log('-CRON- Checking if queue is empty -CRON-');

      // If one or no song in queue
      SongModel.find().where('queue.inQueue').equals(true).exec((err, songs) => {

        if(err){
          console.log('-!- [CRON] An error occured while checking the current queue -!-\n', err, '\n-!-');
        }

        if(songs){

          this.checkSpeakerQueue(songs);

        }

      });

    }, () => { // Callback after job is done

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
          console.log('-!- [CRON] An error occured while checking the current queue -!-\n', err, '\n-!-');
        }

        if(songs && songs.length < config.auto.minSongsInQueue){

          this.addRandomSongToQueue();

        }else{

          this.checkSpeakerQueue(songs);

        }

      });

    }, () => { // Callback after job is done

    },
    true, // Start the job right now
    timeZone // Time zone of this job

  );

  /* --- Daily: Add random song to queue -------------------------------------------- */

  this.cronAddRandomSong = new CronJob(config.auto.cronPatternAddRandomSong, () => {

    console.log('-CRON- Adding random song to queue -CRON-');

      this.addRandomSongToQueue();

    }, () => { // Callback after job is done

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

        console.log('-!- [CRON] Vetos Reset -!-');
        EmitHelper.broadcast('USER_PROFILE_CHANGED');
        console.log('-!- [CRON] Super Votes Reset -!-');

      });

    }, () => { // Callback after job is done

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

        console.log('-!- [CRON] Files scheduled for removal -!-');

      });

    }, () => { // Callback after job is done

    },
    true, // Start the job right now
    timeZone // Time zone of this job

  );

  /* --- Weekly: Remove files scheduled for removal  ---------------------------------------------------------- */

  this.cronRemoveScheduledFiles = new CronJob(config.auto.cronPatternRemoveScheduledFiles, () => {

    console.log('-CRON- Removing files scheduled for removal -CRON-');

      var removeConditions = { 'queue.inQueue': false, 'general.isFileAboutToBeRemoved': true };
      var removeQuery = { 'general.isDownloaded': false, 'general.isFileAboutToBeRemoved': false };
      var removeOptions = {};

      SongModel.find(removeConditions).exec((err, songs) => {

        if(err){
          console.log('-!- [CRON] An error occured while removing files -!-\n', err, '\n-!-');
        }

        if(songs){

          console.log('-?- [CRON] Songs to be removed: ', songs.length,' -?-');

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

      });

      SongModel.update(removeConditions, removeQuery, removeOptions, () => {

        console.log('-!- [CRON] Files removed -!-');
        this.emitCurrentQueue();

      });

    }, () => { // Callback after job is done

    },
    true, // Start the job right now
    timeZone // Time zone of this job

  );

};

