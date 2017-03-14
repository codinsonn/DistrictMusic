require("rootpath")();

//var config = require("config");
var mongoose = require("mongoose");
//var bcrypt = require("bcryptjs");
//var salt = bcrypt.genSaltSync(10);
var Schema = mongoose.Schema;

var SongSchema = new Schema({
    general: {
      id: {
        type: String,
        index: true
      },
      title: {
        type: String,
        index: true
      },
      channel: {
        type: String,
        index: false
      },
      duration: {
        type: String,
        index: false
      },
      filename: {
        type: String,
        index: true
      }
    },
    queue: {
      inQueue: {
        type: Boolean,
        default: true
      },
      lastAddedBy: {
        googleId: {
          type: String,
          required: true
        },
        userName: {
          type: String,
          required: true
        },
        profileImage: {
          type: String,
          required: true
        },
        added: {
          type: Date,
          default: (new Date()).getTime()
        }
      },
      originallyAddedBy: {
        googleId: {
          type: String,
          required: true
        },
        userName: {
          type: String,
          required: true
        },
        profileImage: {
          type: String,
          required: true
        },
        added: {
          type: Date,
          default: (new Date()).getTime()
        }
      },
      votes: {
        currentQueueScore: {
          type: Number,
          default: 0
        },
        legacyScore: {
          type: Number,
          default: 0
        }
      }
    },
    thumbs: {
      default: {
        url: {
          type: String
        },
        width: {
          type: Number
        },
        height: {
          type: Number
        }
      },
      medium: {
        url: {
          type: String
        },
        width: {
          type: Number
        },
        height: {
          type: Number
        }
      },
      high: {
        url: {
          type: String
        },
        width: {
          type: Number
        },
        height: {
          type: Number
        }
      },
    }
});

// Set the name of the collection
SongSchema.set("collection", "songs");

module.exports = mongoose.model("Song", SongSchema);
