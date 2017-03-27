var _ = require("lodash");
var CronJob = require('cron').CronJob;

var path = require('path');
var fs = require('fs');
var fse = require('fs-extra');
var ytdl = require('ytdl-core');
var ffmpeg = require('fluent-ffmpeg');

var EmitHelper = require(__base + "app/helpers/io/emitter");

var UserModel = require(__base + "app/models/user");
var SongModel = require(__base + "app/models/song");

module.exports = function(timeZone) {

  var everyMinute = '00 * * * * 1-60'; // testing
  var everyHourAtTheFirstMinute = '00 01 * * * 1-24'; // testing
  var everyHourAtTheLastMinute = '00 59 * * * 1-24'; // testing
  var everyHour = '00 00 * * * 1-24'; // testing
  var everyWeekdayInTheMorning = '00 00 09 * * 1-5';
  var everyMondayMorning = '00 00 09 * * 1';
  var everySundayNight = '00 00 23 * * 7';

  /* --- Functions ----------------------------------------------------------------------------------------- */

  this.addRandomSongToQueue = () => {

    var query = { 'queue.inQueue': false, 'queue.votes.legacyScore': { $gt: -10 } };

    // Find random unqueued song with legacy score greater than 10
    SongModel.find(query).exec((err, unqueuedSongs) => {

      if(err){
        console.log('-!- [CRON] An error occured while searching for random song -!-\n', err, '\n-!-');
      }

      if(unqueuedSongs){

        var rand = Math.floor(Math.random() * unqueuedSongs.length);

        // Requeue random unqueued song
        SongModel.findOne(query).skip(rand).exec((err, song) => {

          if(err){
            console.log('-!- [CRON] An error occured while queueing random song -!-\n', err, '\n-!-');
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
    var audioFilename = `${song.general.id}${Math.random().toString().substr(2, 3)}.mp4`;
    var tempOutput = path.resolve(tempFolder, audioFilename);
    var audioOutput = path.resolve(audioFolder, audioFilename);

    console.log('Attempting to save video as song in: ', tempOutput);

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
          this.saveSong(song);
        });
      })
      .pipe(fs.createWriteStream(tempOutput))
    ;

  }

  this.saveSong = (song) => {

    song.general.isFileAboutToBeRemoved = false;
    song.queue.votes.currentQueueScore = 0;
    song.queue.lastAddedBy.googleId = 'cronbot';
    song.queue.lastAddedBy.userName = 'cronbot';
    song.queue.lastAddedBy.profileImage = '/assets/img/defaultProfile.png';
    song.queue.lastAddedBy.added = (new Date()).getTime();
    song.queue.isVetoed = false;
    song.queue.inQueue = true;

    return song.save((err) => {

      if (err) {
        console.log('-!- Error occured while updating song: -!-\n', err, '\n-!-');
      } else {
        console.log('[CRON] Cronbot added', song.general.title, 'to the queue!');
        EmitHelper.broadcast('QUEUE_UPDATED');
      }

    });

  }

  /* --- Every Minute: Check if songs need to be added to queue -------------------------------------------- */

  this.checkQueueEmpty = new CronJob(everyMinute, () => {

    //console.log('-CRON- Checking if queue is empty -CRON-');

      // If one or no song in queue
      SongModel.find().where('queue.inQueue').equals(true).exec((err, songs) => {

        if(err){
          console.log('-!- [CRON] An error occured while checking the current queue -!-\n', err, '\n-!-');
        }

        if(songs && songs.length < 3){

          this.addRandomSongToQueue();

        }

      });

    }, () => { // Callback after job is done

    },
    true, // Start the job right now
    timeZone // Time zone of this job

  );

  /* --- Daily: Add random song to queue -------------------------------------------- */

  this.addRandomSongEveryday = new CronJob(everyWeekdayInTheMorning, () => {

    console.log('-CRON- Adding random song to queue -CRON-');

      this.addRandomSongToQueue();

    }, () => { // Callback after job is done

    },
    true, // Start the job right now
    timeZone // Time zone of this job

  );

  /* --- Weekly: Reset Veto & Super Votes ------------------------------------------------------------------ */

  this.resetVotes = new CronJob(everyHour, () => {

    console.log('-CRON- Resetting weekly special votes -CRON-');

      var conditions = {};
      var query = { permissions: { vetosLeft: 1, superVotesLeft: 2 } };
      var options = {};

      UserModel.update(conditions, query, options, () => {

        console.log('-!- [CRON] Vetos Reset -!-');
        console.log('-!- [CRON] Super Votes Reset -!-');

      });

    }, () => { // Callback after job is done

      EmitHelper.broadcast('USER_PROFILE_CHANGED');

    },
    true, // Start the job right now
    timeZone // Time zone of this job

  );

  /* --- Weekly: Schedule unqueued files for removal ----------------------------------------------------------- */

  this.scheduleFilesToBeRemoved = new CronJob(everyHourAtTheFirstMinute, () => {

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

  this.removeScheduledFiles = new CronJob(everyHourAtTheLastMinute, () => {

    console.log('-CRON- Removing files scheduled for removal -CRON-');

      var removeConditions = { 'general.isFileAboutToBeRemoved': true };
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

          });

        }

      });

      SongModel.update(removeConditions, removeQuery, removeOptions, () => {

        console.log('-!- [CRON] Files removed -!-');

      });

    }, () => { // Callback after job is done

    },
    true, // Start the job right now
    timeZone // Time zone of this job

  );

};

