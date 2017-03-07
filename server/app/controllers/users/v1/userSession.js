// Packages
require("rootpath")();
var _ = require("lodash");

// Helpers
//var ResponseHelper = require(__base + "app/helpers/response");
//var PromiseHelper = require(__base + "app/helpers/promise");
var Helpers = require("./helpers");

var authConfig = require(__base + "config/auth");
var passport = require("passport");
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
//var GoogleStrategy = require('passport-google-oauth20').Strategy;
var PassportHelper = require(__base + "app/helpers/passport");

module.exports.check = function(req, res, next) {

  console.log('Check');

  if (req.session.hasOwnProperty("profile")) {

    console.log('Profile in session');
    return req.session.profile;

  } else {

    console.log('Profile not in session');
    next();

  }

};
