// Helpers
var ResponseHelper = require(__base + "app/helpers/response");

module.exports = function(req, res) {
    delete req.session.profile;
    ResponseHelper(res, "ok");
};
