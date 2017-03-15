// Packages
var ObjectId = require("mongoose").Types.ObjectId;

// Convert String Object _id to MongoDB ObjectId
module.exports = (id) => {

  return new ObjectId(id);

};
