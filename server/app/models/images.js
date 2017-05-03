require("rootpath")();

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ImageSchema = new Schema({
    file: {
      imgData: {
        data: Buffer,
        contentType: String
      }
    },
    metadata: {
      mimetype: {
        type: String,
        required: true
      }
    }
});

// Set the name of the collection
ImageSchema.set("collection", "images");

module.exports = mongoose.model("Image", ImageSchema);
