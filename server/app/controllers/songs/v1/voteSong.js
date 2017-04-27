// Packages
require("rootpath")();
var _ = require("lodash");

// Config
var config = require(__base + "config");

// Helpers
var EmitHelper = require(__base + "app/helpers/io/emitter");
var SongHelper = require(__base + "app/controllers/songs/v1/helpers");

// Models
var VoteModel = require(__base + "app/models/vote");
var SongModel = require(__base + "app/models/song");

module.exports = (req, res, done) => {

  this.uservote = req.body;
  this.profile = req.session.profile;

  console.log('--- [VoteSong] --- Adding or updating vote ---');

  if(SongHelper.validateVoteType(this.uservote.voteType)){

    // check if vote doesn't already exist in db
    VoteModel.findOne({ 'song.id': this.uservote.songId, 'user.googleId': this.profile.meta.googleId }, (err, vote) => {

      if (err){

        console.log('-!- [VoteSong:28] -!- Error occured while searching for vote:\n', err, '\n-!-');
        res.statusCode = 400;
        return res.json({ errors: [ 'Error while searching for vote' ] });

      }

      if (vote) { // already voted ( exists in db )

        console.log('[VoteSong:36] User already voted, changing vote value');

        if(vote.voteType != this.uservote.voteType){

          // keep previous vote value handy
          var previousVoteValue = SongHelper.getVoteValue(vote.voteType);

          // update vote type
          vote.voteType = this.uservote.voteType;

          // update vote value
          vote.voteValue = SongHelper.getVoteValue(vote.voteType);

          // save new vote to db
          vote.save((err) => {

            if (err) {

              console.log('-!- [VoteSong:54] -!- Error occured while updating uservote:\n', err, '\n-!-');
              res.statusCode = 500;
              return res.json({ errors: [ 'Could not update uservote' ] });

            }

            var voteValueChange = (vote.voteValue - previousVoteValue);

            // update song score
            this.updateSongScore(voteValueChange);

          });

        }else{

          VoteModel.findOneAndRemove({ 'song.id': this.uservote.songId, 'user.googleId': this.profile.meta.googleId }, (err) => {

            if (err) {

              console.log('-!- [VoteSong:73] -!- Error occured while removing current vote:\n', err, '\n-!-');
              res.statusCode = 500;
              return res.json({ errors: [ 'Could not remove previous vote' ] });

            }

            var changeValue = 0 - SongHelper.getVoteValue(this.uservote.voteType);

            this.updateSongScore(changeValue);

          });

        }

      } else {

        console.log('[VoteSong:89] Adding new vote');

        var newVote = new VoteModel();

        // -- general ----------
        console.log('[VoteSong:94] Setting vote type');
        newVote.voteType = this.uservote.voteType;

        console.log('[VoteSong:97] Setting vote value');
        newVote.voteValue = SongHelper.getVoteValue(this.uservote.voteType);

        // -- user info --------
        console.log('[VoteSong:101] Setting user googleId');
        newVote.user.googleId = this.profile.meta.googleId;

        console.log('[VoteSong:104] Setting user email');
        newVote.user.email = this.profile.general.email;

        console.log('[VoteSong:107] Setting user full name');
        newVote.user.fullName = this.profile.general.fullName;

        // -- song info --------
        console.log('[VoteSong:111] Setting song id');
        newVote.song.id = this.uservote.songId;

        console.log('[VoteSong:114] Setting song title');
        newVote.song.title = this.uservote.songTitle;

        // -- save to db -------
        newVote.save((err) => {

          if (err) {

            console.log('-!- [VoteSong:122] -!- Error occured while adding new vote:\n', err, '\n-!-');
            res.statusCode = 500;
            return res.json({ errors: [ 'Could not add new vote' ] });

          }

          // update song score
          this.updateSongScore(newVote.voteValue);

        });

      }

    });

  }else{

    console.log('-!- [VoteSong:139] -!- Invalid vote type');

  }

  this.updateSongScore = (voteValue) => {

    SongModel.findOne({ 'general.id': this.uservote.songId, 'general.title': this.uservote.songTitle }, (err, song) => {

      if (err){

        console.log('-!- [VoteSong:149] -!- Error occured while searching for song:\n', err, '\n-!-');
        res.statusCode = 400;
        return res.json({ errors: [ 'Error while searching for song' ] });

      }

      if(song){

        // update current queue score
        song.votes.currentQueueScore += voteValue;

        // update legacy score
        song.votes.legacyScore += voteValue;

        // -- check if veto ----
        if(this.uservote.voteType === 'veto_upvote'){
          song.queue.isVetoed = true;
        }else if(this.uservote.voteType === 'veto_downvote'){
          song.votes.currentQueueScore = 0;
          song.queue.inQueue = false;
          song.queue.isPlaying = false;
          SongHelper.removeVotesForSong(song.general.id);
        }

        // -- check if under minimum vote score ----
        if(song.votes.currentQueueScore < config.auto.minVoteScore){
          song.votes.currentQueueScore = 0;
          song.queue.inQueue = false;
          song.queue.isPlaying = false;
          SongHelper.removeVotesForSong(song.general.id);
        }

        // -- save to db -------
        song.save((err) => {

          if (err) {

            console.log('-!- [VoteSong:186] -!- Error occured while updating song score:\n', err, '\n-!-');
            res.statusCode = 500;
            return res.json({ errors: [ 'Could not update song score' ] });

          }

          this.respondSuccess(song);

        });

      }else{

        console.log('-!- [VoteSong:198] -!- Can\'t find song');
        res.statusCode = 412;
        return res.json({ errors: [ 'Song not found' ] });

      }

    });

  }

  this.respondSuccess = (song) => {

    SongHelper.getCurrentQueue().then((currentQueue) => {

      console.log('-e- [VoteSong] -e- Vote successfull! Broadcasting for update');
      EmitHelper.broadcast('QUEUE_UPDATED', currentQueue);

      console.log('-/- [VoteSong] -/- Song score updated! =>', song.votes.currentQueueScore);
      res.setHeader('Last-Modified', (new Date()).toUTCString());
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", 0);
      res.statusCode = 200;
      res.json(song.queue);

    }, (failData) => {

      console.log('-!- [VoteSong:214] -!- Failed:', failData);

    });

  }

};
