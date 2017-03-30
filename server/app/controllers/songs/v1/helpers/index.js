var validateVoteType = require("./validateVoteType");
var getVoteValue = require("./getVoteValue");
var removeVotesForSong = require("./removeVotesForSong");
var getCurrentQueue = require("./getCurrentQueue");

module.exports = {
  validateVoteType: validateVoteType,
  getVoteValue: getVoteValue,
  removeVotesForSong: removeVotesForSong,
  getCurrentQueue: getCurrentQueue
};
