require("rootpath")();

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ImageSchema = new Schema({
    file: {
      filename: {
        type: String,
        required: true,
        index: true
      },
      imgData: {
        data: String,
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
