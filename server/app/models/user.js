require("rootpath")();

//var config = require("config");
var mongoose = require("mongoose");
//var bcrypt = require("bcryptjs");
//var salt = bcrypt.genSaltSync(10);
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    general: {
      id: {
        type: String,
        index: true
      },
      email: {
        type: String,
        index: true
      },
      fullName: {
        type: String,
        index: true
      },
      firstName: {
        type: String,
        index: true
      },
      lastName: {
        type: String,
        index: true
      },
      profileImage: {
        type: String,
        required: true,
        default: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAACrklEQVR42u2Z6U8TQRjG+wcLbT0gSEw0HiHRD8ZoPMCttEXRyqliEYJUQbYteEQM0uIf4Ad2e+2y7ZfXfaZdrwh0x9kyJfPhSTfbNp3fzns909Bw+jsdB4VOPjDoOEiBKBAFokAUCEVjBkVcXZ0p051XVbq3UKVrs2U6Ndp8rytAsNDR5RrlinXKFuq0tt0UrnFvfMWSH+RM3KClTefn4vdT5otDA2OmnCBhzaD0h71DITwtfXYoHJMQ5PqLyh+hdJh0V8OLVblAsBvzH9vfDU9vtxzqub8rDwgSfONbwzdIfqdB/UmJdmRgzGCL8guCKnZ5oiQPSF+CH+TcuCkPCOJ8ZcvhAhFVuYTlSPJNzTfIhG6zCUCq8tuXMH2V3/xOnQYfmXJ29qHpMuWLbUAUG3RjrkJRWUcUhNiVyTKtfnVIL/y7CeI+BshIrEvG+FvpCk3nbDZXQTN5m03BXelH8NR73YoGRTRlrBSImMRvhRYGSgjXQblDoSDNfDDo/JMSS/REpuY2PIueb9hMk1mLNU28d/FpqQmnSQLieXP0BFQovWVn9YN8SOsz0LN1m31XhJfnBulPmuwJs4UX6r7Hk7/BHq9azP7yAoV4TNRdtx/kivyLP2hswcFFrxYwCCCmsvZ/7UA7Fjjtus1oUCDYciRwkBC/K7Vm+RpjfO3IOod54hV+6+xDUzzIhVSJywXyCjk4NFUWD4L8SL2zOgaC0oy+FEhoIQH9HMLxannTCb784lh04VNwMK9diNPxDjVEVLBZ119kBVYwVMO593vsQXW0syN+b76sCIFBYqPJhrUjHBoRBvGM/1FF3/41mmDckeY4CK8YABFy3nGoNxx6wj3sIGzv7fmq0D9+hPsRjOY9I7vsTBfHoZdawjUa3ImRYGyvcogKRIEoEAVyJPoBDC5taXEftRAAAAAASUVORK5CYII="
      }
    },
    permissions: {
      vetosLeft: {
        type: Number,
        default: 1
      },
      superVotesLeft: {
        type: Number,
        default: 2
      },
      isSpeaker: {
        type: Boolean,
        required: true,
        default: false
      }
    },
    meta: {
      socketIds: [],
      googleId: {
        type: String,
        index: true
      },
      googleAuthToken: {
        type: String,
        index: true
      },
      googleRefreshToken: {
        type: String,
        index: true
      },
      created: {
        type: Number,
        required: true,
        default: function() {
          return new Date().getTime();
        }
      },
      lastModified: {
        type: Number,
        required: true,
        default: function() {
          return new Date().getTime();
        }
      },
      code: {
        type: Number
      },
      enabled: {
        type: Boolean,
        required: true,
        default: false
      }
    }
});

// Set the name of the collection
UserSchema.set("collection", "users");

//

// Hash the password before saving it
/*UserSchema.methods.hashPassword = function(password) {
    return bcrypt.hashSync(password, salt);
};

// Compare the password for the login
UserSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.general.password);
};*/

module.exports = mongoose.model("User", UserSchema);
