var validateVoteType = require("./validateVoteType");
var getVoteValue = require("./getVoteValue");
var removeVotesForSong = require("./removeVotesForSong");
var getCurrentQueue = require("./getCurrentQueue");
var getBestOfAllTime = require("./getBestOfAllTime");
var addRandomSong = require("./addRandomSong");

module.exports = {
  validateVoteType: validateVoteType,
  getVoteValue: getVoteValue,
  removeVotesForSong: removeVotesForSong,
  getCurrentQueue: getCurrentQueue,
  getBestOfAllTime: getBestOfAllTime,
  addRandomSong: addRandomSong
};
