var _ = require("lodash");
var CronJob = require('cron').CronJob;
var path = require('path');
var fse = require('fs-extra');

var SpeakerModel = require(__base + "app/models/speaker");

module.exports = function() {

  SpeakerModel.findOne().exec((err, speaker) => {

    if(err){
      console.log('-!- [SPEAKER] Error whilst searching for speaker -!-');
      res.statusCode = 500;
      return done(null, res.json({ error: err }));
    }

    if(speaker){

      if(speaker.meta.socketIds.length >= 1){

        speaker.queue.currentSongPos = 0;
        speaker.meta.socketIds = [];

        speaker.save((err) => {

          if (err){
            console.log('-!- [SPEAKER] Error whilst saving speaker -!-', err);
          }

          console.log('[SPEAKER] Speaker reset');

        });

      }

    }

  });

};

