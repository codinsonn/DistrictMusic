// Packages
require("rootpath")();

// Helpers
var EmitHelper = require(__base + "app/helpers/io/emitter");

// Models
var SpeakerModel = require(__base + "app/models/speaker");

module.exports = function(socketId) {

  SpeakerModel.findOne().exec((err, speaker) => {

    if(err){
      console.log('-!- [SPEAKER] Error whilst searching for speaker -!-');
      res.statusCode = 500;
      return done(null, res.json({ error: err }));
    }

    if(speaker){

      if(speaker.meta.socketIds.length > 0 && speaker.meta.socketIds.indexOf(socketId) > -1){

        console.log('-!- [SPEAKER] Speaker disconnecting (1) -!-');

        speaker.queue.currentSongPos = 0;
        speaker.meta.socketIds = [];

        // Save the speaker
        return speaker.save((err) => {

          if (err){
            throw err;
          }else{

            //delete req.session.speaker;
            console.log('-!- [SPEAKER] Speaker disconnected (2) -!-');
            EmitHelper.broadcast('SPEAKER_UNSET');
            console.log('-!- [SPEAKER] Speaker disconnected (3) -!-');

          }

        });

      }

    }

  });

};
