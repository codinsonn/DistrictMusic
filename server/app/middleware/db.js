require("rootpath")();

var mongoose = require("mongoose");
var config = require(__base + "config");
var GridFS = require(__base + "app/middleware/gridfs");

let connectUrl = `mongodb://${config.mongo.url}/${config.mongo.db}`;
if(config.production){
  connectUrl = `mongodb://${config.mongo.admin}:${config.mongo.password}@${config.mongo.cluster}-shard-00-00-zdfxx.mongodb.net:27017,${config.mongo.cluster}-shard-00-01-zdfxx.mongodb.net:27017,${config.mongo.cluster}-shard-00-02-zdfxx.mongodb.net:27017/${config.mongo.db}?ssl=true&replicaSet=${config.mongo.cluster}-shard-0&authSource=admin`;
}

// Connect to db
mongoose.connect(connectUrl);
mongoose.connection.on('error', function (err) {
  console.error('MongoDB error: ' + err.message);
  console.error('Make sure a mongoDB server is running and accessible by this application')
});

mongoose.Promise = require("pinkie");

// Initialize GridFS
//GridFS.initialize();
