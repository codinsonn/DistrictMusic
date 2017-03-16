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

      //console.log('playlistQueue:\n', playlistQueue, '\n----\n');

      res.statusCode = 200;
      return done(null, res.json(playlistQueue));

    }else{

      console.log('-?- No songs in queue -?-');

      res.statusCode = 200;
      return done(null, res.json(playlistQueue));

    }

  }

};
