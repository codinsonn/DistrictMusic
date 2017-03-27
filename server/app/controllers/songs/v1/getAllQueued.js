// Packages
require("rootpath")();
var _ = require("lodash");

var path = require('path');

//var EmitHelper = require(__base + "app/helpers/io/emitter");

// Models
var SongModel = require(__base + "app/models/song");
var VoteModel = require(__base + "app/models/vote");

module.exports = (req, res, done) => {

  console.log('-?- Attempting to fetch queued songs -?-');

  this.currentQueue = [];
  this.returnQueue = [];

  SongModel.
    find().
    where('queue.inQueue').equals(true).
    sort('-queue.votes.currentQueueScore').
    exec((err, data) => this.handleQueued(err, data))
  ;

  this.handleQueued = (err, playlistQueue) => {

    if(err){

      console.log('-!- An Error occured while fetching queued songs -!-\n', err);

      res.statusCode = 500;
      return done(null, res.json(err));

    }

    if(playlistQueue){

      if(req.session.profile){

        //console.log('[GetAllQueued] Profile in session');

        this.currentQueue = playlistQueue;

        var i = 0;
        _.forEach(playlistQueue, (queItem) => {

          this.addUserVote(i, queItem.general.id);
          i++;

        });

      }else{

        this.returnQueue = playlistQueue;
        this.sortQueue();

      }

    }else{

      console.log('-?- No songs in queue -?-');

      res.statusCode = 200;
      return done(null, res.json(playlistQueue));

    }

  }

  this.sortQueue = () => {

    this.returnQueue.sort((song1, song2) => {

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

    if(!this.returnQueue[0].queue.isPlaying){
      console.log('[GetAllQueued] Set as playing:', this.returnQueue[0].general.title);
      this.returnQueue[0].queue.isPlaying = true;
      var firstsong = this.returnQueue[0];
      SongModel.update(
        {'general.id': firstsong.general.id, 'general.title': firstsong.general.title},
        {'queue.isPlaying': true}, {}, () => {
          console.log('[GetAllQueued] Updated playing song');
          this.respondQueue();
        }
      );
    }else{
      console.log('[GetAllQueued] First song playing:', this.returnQueue[0].queue.isPlaying);
      this.respondQueue();
    }

  }

  this.respondQueue = () => {

    res.statusCode = 200;
    return done(null, res.json(this.returnQueue));

  }

  this.addUserVote = (index, songId) => {

    VoteModel.findOne({ 'user.googleId': req.session.profile.meta.googleId, 'song.id': songId }, (err, uservote) => {

      if(err){
        console.log('Error occured', err);
      }

      var queueItem = {
        uservote: {
          hasVoted: false
        }
      };

      if(uservote){
        queueItem.uservote = uservote;
        queueItem.uservote.hasVoted = true;
      }else{
        queueItem.uservote.hasVoted = false;
      }

      queueItem.general = this.currentQueue[index].general;
      queueItem.queue = this.currentQueue[index].queue;
      queueItem.thumbs = this.currentQueue[index].thumbs;

      this.returnQueue.push(queueItem);

      if(this.returnQueue.length === this.currentQueue.length){
        this.respondQueue();
      }

    });

  }

};
