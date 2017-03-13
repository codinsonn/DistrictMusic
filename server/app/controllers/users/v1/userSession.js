// Packages
require("rootpath")();
var _ = require("lodash");

// Helpers
var ResponseHelper = require(__base + "app/helpers/response");
var PromiseHelper = require(__base + "app/helpers/promise");
var Helpers = require("./helpers");

var authConfig = require(__base + "config/auth");
var passport = require("passport");
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
//var GoogleStrategy = require('passport-google-oauth20').Strategy;
var PassportHelper = require(__base + "app/helpers/passport");

var UserModel = require(__base + "app/models/user");

module.exports.require = function(req, res, next) {

  if (req.session.profile) {

    console.log('Profile in session');

    var profile = req.session.profile;

    UserModel.findOne({ 'general.email': profile.general.email, 'meta.googleId': profile.meta.googleId, 'meta.googleAuthToken': profile.meta.googleAuthToken }, (err, user) => {

      if (err){

        console.log('Error occured while searching user:', err);
        return done(err);

      }

      if (user) {

        //console.log('- User in database -\n', user, '\n---');

        next();

      } else {

        console.log('Unknown user');

        res.statusCode = 401;
        return res.json({
          errors: [
            'Unknown user'
          ]
        });

      }

    });

  } else {

    console.log('Profile not in session');

    res.statusCode = 401;
    return res.json({
      errors: [
        'No user in session'
      ]
    });

  }

};

module.exports.check = function(req, res, next) {

  if (req.session.profile) {

    console.log('Profile in session');
    res.statusCode = 200;
    //return res.json(req.session.profile);

  } else {

    console.log('Profile not in session');

  }

  next();

};

module.exports.returnProfile = function(req, res, next) {

  if (req.session.profile) {

    //console.log('Profile in session', sess.profile);

    res.statusCode = 200;
    return res.json(req.session.profile);

  } else {

    //console.log('Sess', sess);

    res.statusCode = 401;
    return res.json({
      errors: [
        'No user in session'
      ]
    });

  };

  next();

};
