require("rootpath")();

var mongoose = require("mongoose");
var config = require(__base + "config");
var GridFS = require(__base + "app/middleware/gridfs");

var connectUrl = `mongodb://${config.mongo.url}/${config.mongo.db}`;
if(config.production){
  connectUrl = `mongodb://${config.mongo.admin}:${config.mongo.password}@ds145750.mlab.com:45750/${config.mongo.db}`;
}

console.log('[Middleware:DB] Attempting to connect to mongodb:', connectUrl);

// Connect to db
mongoose.connect(connectUrl);
mongoose.connection.on('error', function (err) {
  console.error('MongoDB error: ' + err.message);
  console.error('Make sure a mongoDB server is running and accessible by this application')
});

mongoose.Promise = require("pinkie");

// Initialize GridFS
GridFS.initialize();
