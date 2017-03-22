// Packages
require("rootpath")();

// Models
var VoteModel = require(__base + "app/models/vote");

module.exports = function(songId) {

  var query = { 'song.id': songId };

  VoteModel.find(query).remove().exec((err, data) => {

    if(err){
      console.log('-!- An error occured whilst removing votes: -!-\n', err, '\n-!-');
    }

    if(data){
      console.log('[RemoveVotesForSong] Removed votes for song:', songId);
    }

  });

};
