// Packages
require("rootpath")();

// Helpers
var EmitHelper = require(__base + "app/helpers/io/emitter");

// Models
//var VoteModel = require(__base + "app/models/vote");

module.exports = function(voteType) {

  switch(voteType){

    case "upvote":
      return 1;
      break;

    case "downvote":
      return -1;
      break;

    case "super_upvote":
      return 10;
      break;

    case "super_downvote":
      return -10;
      break;

    default:
      return 0;
      break;

  }

};
