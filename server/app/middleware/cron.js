var _ = require("lodash");
var CronJob = require('cron').CronJob;

var UserModel = require(__base + "app/models/user");

module.exports = function(timeZone) {

  //var everyWeekdayInTheMorning = '00 00 09 * * 1-5';
  var everyHour = '00 00 * * * 1-24';
  //var everyMinute = '00 * * * * 1-60';

  this.resetVotes = new CronJob(everyHour, () => {

      console.log('-+- Running vote reset ---------');

      var conditions = {};
      var query = { permissions: { vetosLeft: 1, superVotesLeft: 2 } };
      var options = {};

      UserModel.update(conditions, query, options, () => {

        //console.log('-!- Job Done: Vetos Reset -!-');

      });

    }, () => { /* Callback after job = done */

      console.log('-!- Job Done: Vetos Reset ---');

    },
    true, /* Start the job right now */
    timeZone /* Time zone of this job. */

  );

};

