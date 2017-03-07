require("rootpath")();
var mongoose = require("mongoose");
var config = require(__base + "config");
var GridFS = require(__base + "app/middleware/gridfs");

// Connect to db
mongoose.connect("mongodb://" + config.mongo.url + "/" + config.mongo.db);
mongoose.connection.on('error', function (err) {
  console.error('MongoDB error: ' + err.message);
  console.error('Make sure a mongoDB server is running and accessible by this application')
});

mongoose.Promise = require("pinkie");

// Initialize GridFS
//GridFS.initialize();
