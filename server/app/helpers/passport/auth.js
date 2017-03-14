// Packages
require("rootpath")();
var passport = require("passport");
var googleStrategy = require('passport-google-oauth').OAuth2Strategy;

// Helpers
var ResponseHelper = require(__base + "app/helpers/response");
var PromiseHelper = require(__base + "app/helpers/promise");
//var TranslateHelper = require("../../../app/helpers/translate");
var UserHelper = require(__base + "app/controllers/users/v1/helpers");

// Models
var UserModel = require(__base + "app/models/user");

module.exports = (req, token, refreshToken, profile, done) => {

  //process.nextTick(() => {

    UserModel.findOne({ 'general.email': profile.emails[0].value.toLowerCase() }, (err, user) => {

      if (err){

        console.log('Error occured while searching user:', err);
        return done(err);

      }

      if (user) {

        /*user.general.id = profile.id;
        user.meta.googleId = profile.id;
        user.save();
        /**/

        //console.log('- Found user: - \n', user);
        req.session.profile = user;
        console.log('UserSession', req.session.profile);

        // if a user is found, log them in
        return done(null, user);

      } else {

        console.log('- Creating new user -');

        // Create new user if none was found (authorized anyway if domain matches Distric01)
        var user = new UserModel();

        // Add google id
        user.general.id = profile.id;
        console.log('set id:', user.meta.googleId);
        // Set email
        user.general.email = profile.emails[0].value.toLowerCase();
        console.log('set email:', user.general.email);
        // Set fullName
        user.general.fullName = profile.displayName;
        console.log('set fullname:', user.general.fullName);
        // Set firstName
        user.general.firstName = profile.name.givenName;
        console.log('set firstName:', user.general.firstName);
        // Set firstLast
        user.general.lastName = profile.name.familyName;
        console.log('set lastname:', user.general.lastName);
        // Set profile image
        user.general.profileImage = profile.photos[0].value;
        console.log('set profileImage:', user.general.profileImage);

        // Set veto permissions
        user.permissions.vetosLeft = 1;
        console.log('set vetos:', user.permissions.vetosLeft);
        // Set super vote permissions
        user.permissions.superVotesLeft = 2;
        console.log('set supers:', user.permissions.superVotesLeft);

        // Set as speaker if email matches speaker
        if(user.general.email === 'speaker@district01.com'){
          user.permissions.isSpeaker = true;
        }else{
          user.permissions.isSpeaker = false;
        }
        console.log('set speaker bool:', user.permissions.isSpeaker);

        // Add google id
        user.meta.googleId = profile.id;
        console.log('set googleId:', user.meta.googleId);
        // Add google token
        user.meta.googleAuthToken = token;
        console.log('set googleAuthToken:', user.meta.googleAuthToken);
        // Add google refresh token
        user.meta.googleRefreshToken = refreshToken;
        console.log('set googleRefreshToken:', user.meta.googleRefreshToken);
        // Add verification code
        user.meta.code = Math.random().toString().substr(2, 3);
        console.log('set validation code:', user.meta.code);
        // Enable account
        user.meta.enabled = true;
        console.log('set enabled:', user.meta.enabled);

        // Set the user on the session
        req.session.profile = user;
        console.log('Session user:', req.session.profile);

        console.log('- Created new user: ', user.general.email, ' -');

        // Save the user
        return user.save((err) => {
          if (err)
            throw err;
          return done(null, user);
        });

      }

    });

  //});

}
