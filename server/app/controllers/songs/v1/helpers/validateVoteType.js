// Packages
require("rootpath")();

// Helpers
var EmitHelper = require(__base + "app/helpers/io/emitter");

// Models
//var VoteModel = require(__base + "app/models/vote");

module.exports = function(voteType) {

  switch(voteType){

    case "upvote":
    case "downvote":
    case "super_upvote":
    case "super_downvote":
      return true;
      break;

    default:
      return false;
      break;

  }

};
