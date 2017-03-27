var addSongToQueue = require("./addSongToQueue");
var getAllQueued = require("./getAllQueued");
var voteSong = require("./voteSong");
var playNext = require("./playNext");

module.exports = {
  addSongToQueue: addSongToQueue,
  getAllQueued: getAllQueued,
  voteSong: voteSong,
  playNext: playNext
};
