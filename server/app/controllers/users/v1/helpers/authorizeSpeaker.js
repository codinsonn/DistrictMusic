// Packages
require("rootpath")();
var _ = require("lodash");

var EmitHelper = require(__base + "app/helpers/io/emitter");

var SpeakerModel = require(__base + "app/models/speaker");

module.exports = (req, res, next) => {

  this.setAsSpeaker = req.body.setAsSpeaker;
  this.socketId = req.body.socketId;

  if(this.setAsSpeaker){
    this.setSpeaker();
  }else{
    this.unsetSpeaker();
  }

  this.setSpeaker = () => {

    SpeakerModel.findOne().exec((err, speaker) => {

      if(err){
        console.log('-!- [SPEAKER] Error whilst searching for speaker -!-');
        res.statusCode = 500;
        return done(null, res.json({ error: err }));
      }

      if(speaker){

        if(speaker.meta.socketIds.length === 0){

          speaker.queue.currentSongPos = 0;
          speaker.meta.socketIds = [this.socketId];

          this.saveSpeaker(speaker);

        }else{

          console.log('-!- [SPEAKER] Speaker already set: ', speaker.meta.socketIds,' -!-');
          res.statusCode = 401;
          return done(null, res.json({ error: "Speaker already connected" }));

        }

      }else{

        var newSpeaker = new SpeakerModel();

        newSpeaker.queue.currentSongPos = 0;
        newSpeaker.meta.socketIds = [this.socketId];

        this.saveSpeaker(newSpeaker);

      }

    });

  }

  this.unsetSpeaker = () => {

    SpeakerModel.findOne().exec((err, speaker) => {

      if(err){
        console.log('-!- [SPEAKER] Error whilst searching for speaker -!-');
        res.statusCode = 500;
        return done(null, res.json({ error: err }));
      }

      if(speaker){

        if(speaker.meta.socketIds.length === 0){

          speaker.queue.currentSongPos = 0;
          speaker.meta.socketIds = [];

          this.saveSpeaker(speaker);

        }

      }

    });

  }

  this.saveSpeaker = (speaker) => {

    // Save the speaker
    return speaker.save((err) => {

      if (err)
        throw err;

      if(this.setAsSpeaker){
        req.session.isSpeaker = true;
        EmitHelper.broadcast('SPEAKER_RESET');
        console.log('-?- [SPEAKER] UPDATED SPEAKER: ', speaker.meta.socketIds[0], ' -?-');
      }else{
        req.session.isSpeaker = false;
        EmitHelper.broadcast('SPEAKER_UNSET');
        console.log('-!- [SPEAKER] UNSET SPEAKER -!-');
      }

      return done(null, speaker);

    });

  }

};


