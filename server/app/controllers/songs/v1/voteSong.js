// Packages
require("rootpath")();
var _ = require("lodash");

var EmitHelper = require(__base + "app/helpers/io/emitter");
var VoteHelper = require(__base + "app/controllers/songs/v1/helpers");

// Models
var VoteModel = require(__base + "app/models/vote");
var SongModel = require(__base + "app/models/song");

module.exports = (req, res, done) => {

  this.uservote = req.body;
  this.profile = req.session.profile;

  if(VoteHelper.validateVoteType(this.uservote.voteType)){

    // check if vote doesn't already exist in db
    VoteModel.findOne({ 'song.id': this.uservote.songId, 'user.googleId': this.profile.meta.googleId }, (err, vote) => {

      if (err){

        console.log('-!- Error occured while searching for vote: -!-\n', err, '\n-!-');
        res.statusCode = 400;
        return res.json({
          errors: [
            'Error while searching for vote'
          ]
        });

      }

      if (vote) { // already voted ( exists in db )

        console.log('[VoteSong] User already voted, changing vote value');

        if(vote.voteType != this.uservote.voteType){

          // keep previous vote value handy
          var previousVoteValue = VoteHelper.getVoteValue(vote.voteType);

          // update vote type
          vote.voteType = this.uservote.voteType;

          // update vote value
          vote.voteValue = VoteHelper.getVoteValue(vote.voteType);

          // save new vote to db
          vote.save((err) => {

            if (err) {

              console.log('-!- Error occured while updating uservote: -!-\n', err, '\n-!-');
              res.statusCode = 500;
              return res.json({
                errors: [
                  'Could not update uservote'
                ]
              });

            }

            var voteValueChange = (vote.voteValue - previousVoteValue);

            // update song score
            this.updateSongScore(voteValueChange);

          });

        }else{

          VoteModel.findOneAndRemove({ 'song.id': this.uservote.songId, 'user.googleId': this.profile.meta.googleId }, (err) => {

            if (err) {

              console.log('-!- Error occured while removing current vote: -!-\n', err, '\n-!-');
              res.statusCode = 500;
              return res.json({
                errors: [
                  'Could not remove previous vote'
                ]
              });

            }

            var changeValue = 0 - VoteHelper.getVoteValue(this.uservote.voteType);

            this.updateSongScore(changeValue);

          });

        }

      } else {

        console.log('[VoteSong] Adding new vote');

        var newVote = new VoteModel();

        // -- general ----------
        console.log('[VoteSong] Setting vote type');
        newVote.voteType = this.uservote.voteType;

        console.log('[VoteSong] Setting vote value');
        newVote.voteValue = VoteHelper.getVoteValue(this.uservote.voteType);

        // -- user info --------
        console.log('[VoteSong] Setting user googleId');
        newVote.user.googleId = this.profile.meta.googleId;

        console.log('[VoteSong] Setting user email');
        newVote.user.email = this.profile.general.email;

        console.log('[VoteSong] Setting user googleId');
        newVote.user.googleId = this.profile.meta.googleId;

        // -- song info --------
        console.log('[VoteSong] Setting song id');
        newVote.song.id = this.uservote.songId;

        console.log('[VoteSong] Setting song title');
        newVote.song.title = this.uservote.songTitle;

        // -- save to db -------
        newVote.save((err) => {

          if (err) {

            console.log('-!- Error occured while adding new vote: -!-\n', err, '\n-!-');
            res.statusCode = 500;
            return res.json({
              errors: [
                'Could not add new vote'
              ]
            });

          }

          // update song score
          this.updateSongScore(newVote.voteValue);

        });

      }

    });

  }else{

    console.log('-!- [VoteSong] Invalid vote type -!-');

  }

  this.updateSongScore = (voteValue) => {

    SongModel.findOne({ 'general.id': this.uservote.songId, 'general.title': this.uservote.songTitle }, (err, song) => {

      if (err){

        console.log('-!- Error occured while searching for song: -!-\n', err, '\n-!-');
        res.statusCode = 400;
        return res.json({
          errors: [
            'Error while searching for song'
          ]
        });

      }

      if(song){

        // update current queue score
        song.queue.votes.currentQueueScore += voteValue;

        // update legacy score
        song.queue.votes.legacyQueueScore += voteValue;

        // -- save to db -------
        song.save((err) => {

          if (err) {

            console.log('-!- Error occured while updating song score: -!-\n', err, '\n-!-');
            res.statusCode = 500;
            return res.json({
              errors: [
                'Could not update song score'
              ]
            });

          }

          this.respondSuccess(song);

        });

      }else{

        console.log('-!- [VoteSong] Can\'t find song -!-');
        res.statusCode = 412;
        return res.json({
          errors: [
            'Song not found'
          ]
        });/**/

      }

    });

  }

  this.respondSuccess = (song) => {

    console.log('- Broadcasting for update -');
    EmitHelper.broadcast('QUEUE_UPDATED', song);

    console.log('- Song score updated! -');
    res.statusCode = 200;
    return res.json(song.queue);

  }

};
