require("rootpath")();

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var VoteSchema = new Schema({
    hasVoted: {
      type: Boolean,
      default: true
    },
    user: {
      googleId: {
        type: String,
        index: true,
        required: true
      },
      email: {
        type: String,
        index: true,
        required: true
      },
      fullName: {
        type: String
      }
    },
    song: {
      id: {
        type: String,
        index: true,
        required: true
      },
      title: {
        type: String,
        index: true,
        required: true
      }
    },
    voteType: {
      type: String,
      required: true
    },
    voteValue: {
      type: Number,
      required: true
    }
});

// Set the name of the collection
VoteSchema.set("collection", "votes");

module.exports = mongoose.model("Vote", VoteSchema);
