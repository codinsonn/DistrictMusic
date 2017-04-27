// Packages
require("rootpath")();
var _ = require("lodash");

var passport = require("passport");
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var PassportHelper = require(__base + "app/helpers/passport");

var UserModel = require(__base + "app/models/user");

module.exports.require = (req, res, next) => {

  if (req.session.profile) {

    //console.log('- Profile in session -', req.session.profile.fullName, req.session.profile.meta.socketIds);

    var profile = req.session.profile;

    UserModel.findOne({ 'general.email': profile.general.email, 'meta.googleId': profile.meta.googleId, 'meta.googleAuthToken': profile.meta.googleAuthToken }, (err, user) => {

      if (err){

        console.log('Error occured while searching user:', err);
        res.statusCode = 500;
        res.json({ errors: ['Could not search for user'] });
        /*return res.json({
          errors: [
            'Could not search for user'
          ]
        });*/

        //next();

      }

      if (user) {

        //console.log('- User in database: ', user.general.fullName, user.meta.socketIds, ' -');

        next();

      } else {

        //console.log('- Unknown user -');

        res.statusCode = 401;
        res.json({ errors: ['Unknown user']});
        /*return res.json({
          errors: [
            'Unknown user'
          ]
        });*/

        //next();

      }

    });

  } else {

    //console.log('- Profile not in session -');

    res.statusCode = 401;
    res.json({ errors: ['No user in session']});
    /*return res.json({
      errors: [
        'No user in session'
      ]
    });*/

    //next();

  }

};

module.exports.check = (req, res, next) => {

  if (req.session.profile) {

    console.log('- Profile in session -', req.session.profile.general.fullName, req.session.profile.meta.socketIds);
    res.statusCode = 200;
    //return res.json(req.session.profile);

  } else {

    //console.log('- Profile not in session -');

  }

  next();

};

module.exports.returnProfile = (req, res, next) => {

  if (req.session.profile) {

    console.log('- Profile in session -', req.session.profile.general.fullName, req.session.profile.meta.socketIds);

    res.statusCode = 200;
    res.json(req.session.profile);

  } else {

    console.log('- No profile in session -');

    res.statusCode = 401;
    res.json({ errors: ['No user in session'] });
    /*return res.json({
      errors: [
        'No user in session'
      ]
    });*/

  };

  //next();

};
