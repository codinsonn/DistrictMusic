// Packages
require("rootpath")();
var _ = require("lodash");

var EmitHelper = require(__base + "app/helpers/io/emitter");

// Models
var SongModel = require(__base + "app/models/song");

module.exports = (req, res, done) => {

  console.log('[PlayNext] ...Removing current song from queue...');

  this.prevSong = req.body;

  SongModel.findOne({ 'general.id': this.prevSong.general.id, "general.title": this.prevSong.general.title }, (err, song) => {

    if (err){

      console.log('-!- Error occured while searching for song: -!-\n', err, '\n-!-');
      res.statusCode = 400;
      return res.json({
        errors: [
          'Could not search for song in db'
        ]
      });

    }

    if (song) { // song exists in db

      console.log('[PlayNext] ...Found current song...');

      // reset queue score
      song.queue.votes.currentQueueScore = 0;

      // put back in queue
      song.queue.isPlaying = false;
      song.queue.isVetoed = false;
      song.queue.inQueue = false;

      // Save the song to put back in queue
      return song.save((err) => {

        if (err) {

          console.log('-!- Error occured while updating song: -!-\n', err, '\n-!-');
          res.statusCode = 500;
          return res.json({
            errors: [
              'Could not update song'
            ]
          });

        }

        this.respondSong(song);

      });

    } else { // create new song to add to queue

      console.log('-!- Song not found -!-');

    }

  });

  this.respondSong = (song) => {

    console.log('[PlayNext] Broadcasting for update');
    EmitHelper.broadcast('QUEUE_UPDATED', song);

    console.log('[PlayNext] Song removed from queue, time for update');
    res.statusCode = 200;
    return res.json(song);

  }

};
