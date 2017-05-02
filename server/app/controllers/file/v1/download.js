// Packages
require("rootpath")();

// Helpers
var GridFSHelper = require(__base + "app/helpers/gridfs");

module.exports.init = function(req, res) {
    GridFSHelper.download(res, req.params.id);
};
