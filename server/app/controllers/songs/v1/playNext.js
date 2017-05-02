// Packages
require("rootpath")();
var _ = require("lodash");

// Helpers
var EmitHelper = require(__base + "app/helpers/io/emitter");
var SongHelper = require(__base + "app/controllers/songs/v1/helpers");

// Models
var SongModel = require(__base + "app/models/song");

module.exports = (req, res, done) => {

  console.log('--- [PlayNext] --- Removing current song from queue...', req.body.general.id, req.body.general.title, '---');

  SongModel.findOne({ 'general.id': req.body.general.id, 'general.title': req.body.general.title }, (err, song) => {

    if (err){

      console.log('-!- [PlayNext:20] -!- Error occured while searching for current song:\n', err, '\n-!-');
      res.statusCode = 400;
      return res.json({ errors: [ 'Could not search for song in db' ] });

    }

    if (song) { // song exists in db

      console.log('[PlayNext:32] Found current song:', song.general.title, song.queue.isPlaying);

      // reset queue score
      song.votes.currentQueueScore = 0;

      // put back in queue
      song.queue.isPlaying = false;
      song.queue.isVetoed = false;
      song.queue.inQueue = false;

      // Save the song to put back in queue
      song.save((err) => {

        if (err) {

          console.log('-!- [PlayNext:47] -!- Error occured while updating song:\n', err, '\n-!-');
          res.statusCode = 500;
          return res.json({ errors: [ 'Could not update song' ] });

        }else{

          console.log('[PlayNext:50] Removing votes for current song...');
          SongHelper.removeVotesForSong(song.general.id);

          console.log('[PlayNext:53] About to update to next song...');
          this.updateCurrentQueue();

        }

      });

    } else {

      console.log('-?- [PlayNext:62] -?- Song not found, adding random song to queue');
      SongHelper.addRandomSong(true); // playing = true

    }

  });

  this.updateCurrentQueue = () => {

    console.log('[PlayNext:71] Attempting to update to next song...');

    SongHelper.getCurrentQueue().then((currentQueue) => {

      console.log('[PlayNext:75] Fetched current queue! First song:', currentQueue[0].general.title, currentQueue[0].queue.isPlaying);

      SongModel.findOne({'general.id': currentQueue[0].general.id, 'general.title': currentQueue[0].general.title}, (err, nextSong) => {

        if (err){

          console.log('-!- [PlayNext:81] -!- Error occured while searching for next song:\n', err, '\n-!-');
          res.statusCode = 400;
          return res.json({ errors: [ 'Could not search for song in db' ] });

        } else if (nextSong) {

          console.log('[PlayNext:87] Found next song:', nextSong.general.title, nextSong.queue.isPlaying);

          // Update current queue
          currentQueue[0].queue.isPlaying = true;
          nextSong.queue.isPlaying = true;

          // Save the nextSong to put back in queue
          nextSong.save((err) => {

            if (err) {

              console.log('-!- [PlayNext:98] -!- Error occured while updating next song: -!-\n', err, '\n-!-');
              res.statusCode = 500;
              return res.json({ errors: [ 'Could not update next song' ] });

            }else{

              currentQueue.sort((song1, song2) => {

                var s1 = 0;
                if(song1.queue.isPlaying) s1 = 20; // don't skip the song currently playing
                if(song1.queue.isVetoed) s1 += 10; // sort by veto
                if(song1.votes.currentQueueScore > song2.votes.currentQueueScore) s1 += 5; // sort by current score
                if(!song1.queue.isVetoed && song1.votes.legacyScore > song2.votes.legacyScore) s1 += 3; // sort by legacy score
                if(song1.queue.lastAddedBy.added < song2.queue.lastAddedBy.added) s1++; // sort by date added

                var s2 = 0;
                if(song2.queue.isPlaying) s2 = 20; // don't skip the song currently playing
                if(song2.queue.isVetoed) s2 += 10;
                if(song2.votes.currentQueueScore > song1.votes.currentQueueScore) s2 += 5;
                if(!song2.queue.isVetoed && song2.votes.legacyScore > song1.votes.legacyScore) s2 += 3;
                if(song2.queue.lastAddedBy.added < song1.queue.lastAddedBy.added) s2++;

                return s2 - s1;

              });

              console.log('-e- [PlayNext:124] -e- Broadcasting for queue update:', currentQueue[0].general.title, '-e-');
              EmitHelper.broadcast('QUEUE_UPDATED', currentQueue);

              console.log('-/- [PlayNext] -/- Song removed from queue, time for update');
              res.setHeader('Last-Modified', (new Date()).toUTCString());
              res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
              res.setHeader("Pragma", "no-cache");
              res.setHeader("Expires", 0);
              res.statusCode = 200;
              return res.json(currentQueue);

            }

          });

        } else { // No song to be played next

          console.log('-?- [PlayNext:141] -?- No next song in queue, adding random song');
          SongHelper.addRandomSong(true); // playing = true

        }

      });

    }, (failData) => {

      console.log('-!- [PlayNext:150] -!- Queue fetch failed:', failData);
      res.statusCode = 404;
      return res.json({ errors: [ failData ] });

    });

  }

};
