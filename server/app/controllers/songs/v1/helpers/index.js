var validateVoteType = require("./validateVoteType");
var getVoteValue = require("./getVoteValue");
var removeVotesForSong = require("./removeVotesForSong");
var getCurrentQueue = require("./getCurrentQueue");
var getBestOfAllTime = require("./getBestOfAllTime");
var addRandomSong = require("./addRandomSong");
var downloadSong = require("./downloadSong");
var uploadVisualisation = require("./uploadVisualisation");

module.exports = {
  validateVoteType: validateVoteType,
  getVoteValue: getVoteValue,
  removeVotesForSong: removeVotesForSong,
  getCurrentQueue: getCurrentQueue,
  getBestOfAllTime: getBestOfAllTime,
  addRandomSong: addRandomSong,
  downloadSong: downloadSong,
  uploadVisualisation: uploadVisualisation
};
