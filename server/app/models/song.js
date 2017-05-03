require("rootpath")();

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var SongSchema = new Schema({
    general: {
      id: {
        type: String,
        index: true,
        required: true
      },
      title: {
        type: String,
        index: true,
        required: true
      },
      channel: {
        type: String,
        index: false,
        required: false
      },
      duration: {
        type: String,
        index: true,
        required: true
      }
    },
    audio: {
      fileId: {
        type: String,
        index: true,
        required: true
      },
      filename: {
        type: String,
        index: true,
        required: true
      },
      isDownloaded: {
        type: Boolean,
        default: false
      },
      scheduledForRemoval: {
        type: Boolean,
        default: false
      },
      audioRemovable: {
        type: Boolean,
        default: true
      }
    },
    waveform: {
      barsSaved: {
        type: Boolean,
        default: false
      },
      barsImage: {
        type: String,
        index: true
      },
      barsProgress: {
        type: String,
        index: true
      },
      waveSaved: {
        type: Boolean,
        default: false
      },
      waveImage: {
        type: String,
        index: true
      },
      waveProgress: {
        type: String,
        index: true
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
    },
    queue: {
      inQueue: {
        type: Boolean,
        default: true
      },
      isVetoed: {
        type: Boolean,
        default: false
      },
      isPlaying: {
        type: Boolean,
        default: false
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
      }
    },
    thumbs: {
      default: {
        url: {
          type: String,
          required: true
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
          type: String,
          required: true
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
          type: String,
          required: true
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
