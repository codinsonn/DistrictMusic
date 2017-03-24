require("rootpath")();

//var config = require("config");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var SpeakerSchema = new Schema({
    queue: {
      currentSongPos: {
        type: Number,
        default: 0
      }
    },
    meta: {
      socketIds: []
    }
});

// Set the name of the collection
SpeakerSchema.set("collection", "speakers");

module.exports = mongoose.model("Speaker", SpeakerSchema);
