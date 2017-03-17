// Packages
require("rootpath")();
var _ = require("lodash");

var path = require('path');

//var EmitHelper = require(__base + "app/helpers/io/emitter");

// Models
var SongModel = require(__base + "app/models/song");
//var UserModel = require(__base + "app/models/user");

module.exports = (req, res, done) => {

  console.log('-?- Attempting to fetch queued songs -?-');

  SongModel.
    find().
    where('queue.inQueue').equals(true).
    sort('-queue.votes.currentQueueScore').
    exec((err, data) => this.returnQueued(err, data))
  ;

  this.returnQueued = (err, playlistQueue) => {

    if(err){

      console.log('-!- An Error occured while fetching queued songs -!-\n', err);

      res.statusCode = 500;
      return done(null, res.json(err));

    }

    if(playlistQueue){

      playlistQueue.sort((song1, song2) => {

        var s1 = 0;
        if(song1.queue.isVetoed) s1 = 10; // sort by veto
        if(song1.queue.votes.currentQueueScore > song2.queue.votes.currentQueueScore) s1 += 5; // sort by current score
        if(song1.queue.votes.legacyScore > song2.queue.votes.legacyScore) s1 += 3; // sort by legacy score
        if(song1.queue.lastAddedBy.added < song2.queue.lastAddedBy.added) s1++; // sort by date added

        var s2 = 0;
        if(song2.queue.isVetoed) s2 = 10;
        if(song2.queue.votes.currentQueueScore > song1.queue.votes.currentQueueScore) s2 += 5;
        if(song2.queue.votes.legacyScore > song1.queue.votes.legacyScore) s2 += 3;
        if(song2.queue.lastAddedBy.added < song1.queue.lastAddedBy.added) s2++;

        return s2 - s1;

      });

      res.statusCode = 200;
      return done(null, res.json(playlistQueue));

    }else{

      console.log('-?- No songs in queue -?-');

      res.statusCode = 200;
      return done(null, res.json(playlistQueue));

    }

  }

};
