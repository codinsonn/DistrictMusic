// Packages
require("rootpath")();
var _ = require("lodash");
var path = require('path');

// Helpers
var EmitHelper = require(__base + "app/helpers/io/emitter");
var SongHelper = require(__base + "app/controllers/songs/v1/helpers");

// Models
var SongModel = require(__base + "app/models/song");
var VoteModel = require(__base + "app/models/vote");

module.exports = (req, res, done) => {

  console.log('--- [GetAllQueued] --- Attempting to fetch queued songs ---');

  SongHelper.getCurrentQueue().then((currentQueue) => {

    if(req.session.profile && currentQueue && currentQueue.length >= 1){ // Add Uservotes

      console.log('[GetAllQueued:22] User logged in, adding uservotes ...');

      var i = 0;
      var returnQueue = [];

      console.log('[GetAllQueued:27] CurrentQueue length:', currentQueue.length);

      _.forEach(currentQueue, (queueItem) => {

        console.log('[GetAllQueued:31] Checking uservote for:', queueItem.general.title);

        VoteModel.findOne({ 'user.googleId': req.session.profile.meta.googleId, 'song.id': queueItem.general.id }, (err, uservote) => {

          if (err) {
            console.log('-!- [GetAllQueued:36] -!- Error occured:\n', err, '-!-');
          }

          var newQueueItem = {
            uservote: {
              hasVoted: false
            }
          };

          if (uservote) {
            newQueueItem.uservote = uservote;
            newQueueItem.uservote.hasVoted = true;
          } else {
            newQueueItem.uservote.hasVoted = false;
          }

          newQueueItem.general = queueItem.general;
          newQueueItem.queue = queueItem.queue;
          newQueueItem.thumbs = queueItem.thumbs;

          returnQueue.push(newQueueItem);

          if(returnQueue.length === currentQueue.length){

            returnQueue.sort((song1, song2) => {

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

            console.log('[GetAllQueued:60] Returning queue (length:', returnQueue.length, ')');

            res.setHeader('Last-Modified', (new Date()).toUTCString());
            res.statusCode = 200;
            return done(null, res.json(returnQueue));

          }

        });

        i++;

      });

    }else{ // User not in session, return queue without uservotes

      console.log('[GetAllQueued:96] About to sort current Queue');

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

      console.log('-/- [GetAllQueued] -/- Returning queue ... ( length:', currentQueue.length, '| first:', currentQueue[0].general.title, '| firstIsPlaying:', currentQueue[0].queue.isPlaying, ')');

      res.setHeader('Last-Modified', (new Date()).toUTCString());
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", 0);
      res.statusCode = 200;
      return res.json(currentQueue);

    }

  }, (failData) => { // No songs in Queue

    console.log('-?- [GetAllQueued:131] -?- Promise Failed: No songs in queue');

    res.statusCode = 404;
    return res.json(failData);

  });

};
