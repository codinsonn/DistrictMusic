// Packages
require("rootpath")();
var mongoose = require("mongoose");
//var Grid = require("gridfs-stream");
var Grid = require("gridfs-locking-stream");

module.exports = {
    gfs: null,
    initialize: function() {
        var _this = this;

        mongoose.connection.once("open", function() {
            _this.gfs = new Grid(mongoose.connection.db, mongoose.mongo);
        });
    }
};
