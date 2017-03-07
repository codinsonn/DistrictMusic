// Packages
require("rootpath")();
var _ = require("lodash");

// Helpers
var ResponseHelper = require(__base + "app/helpers/response");
//var TranslateHelper = require(__base + "app/helpers/translate");
var PromiseHelper = require(__base + "app/helpers/promise");
var Helpers = require("./helpers");

module.exports.check = function(req, res, next) {

  if (req.session.hasOwnProperty("profile")) {
    //ResponseHelper(res, "unauthorized");
    return req.session.profile;
  } else {
    next();
  }

};

module.exports.returnUser = function(req, user) {

  console.log('returning user');

  if (!req.session.hasOwnProperty("profile")) {
    return req.session.profile;
  } else {
    req.session.profile = user;
    console.log('User Session:', req.session.user);
    return req.session.user;
  }

};
