var _ = require("lodash");
var CronJob = require('cron').CronJob;
var path = require('path');
var fs = require('fs');

var EmitHelper = require(__base + "app/helpers/io/emitter");

var UserModel = require(__base + "app/models/user");
var SongModel = require(__base + "app/models/song");

module.exports = function(timeZone) {

  //var everyMinute = '00 * * * * 1-60'; // testing
  //var everyMinuteAtZeroSeconds = '00 * * * * 1-60'; // testing
  //var everyMinuteAtThirtySeconds = '30 * * * * 1-60'; // testing
  var everyHourAtTheFirstMinute = '00 01 * * * 1-24'; // testing
  var everyHourAtTheLastMinute = '00 59 * * * 1-24'; // testing
  var everyHour = '00 00 * * * 1-24'; // testing
  //var everyWeekdayInTheMorning = '00 00 09 * * 1-5';
  //var everyMondayMorning = '00 00 09 * * 1';
  //var everySundayNight = '00 00 23 * * 7';

  this.resetVotes = new CronJob(everyHour, () => {

      console.log('-+- Running vote reset ---------');

      var conditions = {};
      var query = { permissions: { vetosLeft: 1, superVotesLeft: 2 } };
      var options = {};

      UserModel.update(conditions, query, options, () => {

        console.log('-!- Job Done: Vetos Reset -!-');

      });

    }, () => { /* Callback after job = done */

      EmitHelper.broadcast('USER_PROFILE_CHANGED');

    },
    true, /* Start the job right now */
    timeZone /* Time zone of this job. */

  );

  this.scheduleFilesToBeRemoved = new CronJob(everyHourAtTheFirstMinute, () => {

      // --- Schedule files for removal ------------------------------------------------

      console.log('-/- Running files to be RESET -------------------------------------------------------');

      var updateConditions = { 'queue.inQueue': false, 'general.isDownloaded': true, 'general.isFileAboutToBeRemoved': false };
      var updateQuery = { 'general.isFileAboutToBeRemoved': true };
      var updateOptions = {};

      SongModel.update(updateConditions, updateQuery, updateOptions, () => {

        console.log('-!- [Job] Files scheduled for removal -!-');

      });

    }, () => { /* Callback after job = done */



    },
    true, /* Start the job right now */
    timeZone /* Time zone of this job. */

  );

  this.removeScheduledFiles = new CronJob(everyHourAtTheLastMinute, () => {

      // --- Remove files sheduled for removal ------------------------------------------------

      console.log('-/- Running files to be REMOVED -----------------------------------------------------');

      var removeConditions = { 'general.isFileAboutToBeRemoved': true };
      var removeQuery = { 'general.isDownloaded': false, 'general.isFileAboutToBeRemoved': false };
      var removeOptions = {};

      SongModel.find(removeConditions).exec((err, songs) => {

        if(err){
          console.log('-!- An error occured while removing files -!-\n', err, '\n-!-');
        }

        if(songs){

          console.log('------ SONGS TO BE REMOVED: ', songs.length,' ---------------');

          _.forEach(songs, (song) => {

            var audioFilename = song.general.filename;

            var uploadsFolder = `${__base}uploads/audio/`;
            var uploadedFilePath = path.resolve(uploadedFolder, audioFilename);

            var publicFolder = `${__base}public/assets/audio/`;
            var publicFilePath = path.resolve(publicFolder, audioFilename);

            fs.unlinkSync(uploadedFilePath);
            fs.unlinkSync(publicFilePath);

            console.log('[JOB] Removed file:', audioFilePath);

          });

        }

      });

      SongModel.update(removeConditions, removeQuery, removeOptions, () => {

        console.log('-!- [Job] Files removed -!-');

      });

    }, () => { /* Callback after job = done */



    },
    true, /* Start the job right now */
    timeZone /* Time zone of this job. */

  );

};

