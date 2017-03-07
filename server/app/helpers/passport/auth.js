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

module.exports = (token, refreshToken, profile, done) => {

  process.nextTick(() => {

    console.log('Test');

    UserModel.findOne({ 'general.email': profile._json.email.toLowerCase() }, (err, user) => {

      if (err)

        return done(err);

      if (user) {
        // if a user is found, log them in
        return UserHelper.findUser(response._id.toString(), false, null, true, true);
        //return done(null, user)
      } else {

        // Create new user if none was found (authorized anyway if domain matches Distric01)
        var user = new UserModel();

        // Set email
        user.general.email = profile._json.email.toLowerCase();
        // Set fullName
        user.general.fullName = profile._json.name;
        // Set firstName
        user.general.firstName = profile._json.given_name;
        // Set firstLast
        user.general.lastName = profile._json.family_name;
        // Set profile image
        user.general.profileImage = profile._json.picture;

        // Set veto permissions
        user.permissions.vetosLeft = 1;
        // Set super vote permissions
        user.permissions.superVotesLeft = 2;

        // Set as speaker if email matches speaker
        if(profile._json.email === 'speaker@district01.com'){
          user.permissions.isSpeaker = true;
        }else{
          user.permissions.isSpeaker = false;
        }

        // Add google id
        user.meta.googleId = profile.id;
        // Add google token
        user.meta.googleAuthToken = token;
        // Add google refresh token
        user.meta.googleRefreshToken = refreshToken;
        // Add verification code
        user.meta.code = Math.random().toString().substr(2, 3);
        // Enable account
        user.meta.enabled = true;

        // Set the user on the session
        req.session.profile = user;

        console.log('- Created new user: ', user.general.email, ' -');

        // Save the user
        return user.save((err) => {
          if (err)
            throw err;
          return done(null, newUser);
        });

      }

    });

  });

}

/*module.exports = function(token, refreshToken, profile, done) {

  // Delete passport from session
  delete req.session.passport;

  console.log('Google User Profile:', profile);

  if(profile._json.hd === "district01.be"){

    console.log('District01 Profile:', profile);

    // Find the profile based on the email
    UserModel.findOne({ "general.email": profile._json.email.toLowerCase() })
      .exec()
      .then(onSuccess = (response) => {

        // Check if user exist: fetch if exists, create if not
        if (response) {

          return UserHelper.findUser(response._id.toString(), false, null, true, true);

        } else {

          console.log('- Creating new user: ', user.general.email, ' -');

          // Create new user if none was found (authorized anyway if domain matches Distric01)
          var user = new UserModel();

          // Set email
          user.general.email = profile._json.email.toLowerCase();
          // Set fullName
          user.general.fullName = profile._json.name;
          // Set firstName
          user.general.firstName = profile._json.given_name;
          // Set firstLast
          user.general.lastName = profile._json.family_name;
          // Set profile image
          user.general.profileImage = profile._json.picture;

          // Set veto permissions
          user.permissions.vetosLeft = 1;
          // Set super vote permissions
          user.permissions.superVotesLeft = 2;

          // Set as speaker if email matches speaker
          if(profile._json.email === 'speaker@district01.com'){
            user.permissions.isSpeaker = true;
          }else{
            user.permissions.isSpeaker = false;
          }

          // Add google token
          user.meta.googleAuthToken = token;
          // Add google refresh token
          user.meta.googleRefreshToken = refreshToken;
          // Add verification code
          user.meta.code = Math.random().toString().substr(2, 3);
          // Enable account
          user.meta.enabled = true;

          // Set the user on the session
          req.session.profile = user;

          console.log('- Created new user: ', user.general.email, ' -');

          // Save the user
          return user.save();

        }

      })
      .then(onSuccess = (response) => {

        // Save profile on the session
        req.session.profile = response;

        console.log('- Logged in as: ', response.general.email, ' -');

        return {
          type: "ok",
          data: UserHelper.fillBlueprint(req.session.profile)
        };

      }, PromiseHelper.checkError)
      .then(onSuccess = (response) => {

        ResponseHelper(res, response.type, {
          data: response.data
        });

      });

  }else{

    console.log('Not a District01 profile', profile);

    throw {
      type: "notFound"
    };

  }

};*/

/* module.exports = function(req, res) {

    // Delete passport from session
    delete req.session.passport;

    passport.use(new GoogleStrategy({
      clientID: "988274792144-8f4hj5jj2qja2fagh9stkfe5f8dpfbau.apps.googleusercontent.com",
      clientSecret: "6RoBvh-aw5nUE4iOnNDHB2TE",
      callbackURL: "/auth/google/callback"
    }, (token, refreshToken, profile, done) => {

      console.log('Google User Profile:', profile);

      if(profile._json.hd === "district01.be"){

        console.log('District01 Profile:', profile);

        // Find the profile based on the email
        UserModel.findOne({ "general.email": profile._json.email.toLowerCase() })
          .exec()
          .then(onSuccess = (response) => {

            // Check if user exist: fetch if exists, create if not
            if (response) {

              return UserHelper.findUser(response._id.toString(), false, null, true, true);

            } else {

              console.log('- Creating new user: ', user.general.email, ' -');

              // Create new user if none was found (authorized anyway if domain matches Distric01)
              var user = new UserModel();

              // Set email
              user.general.email = profile._json.email.toLowerCase();
              // Set fullName
              user.general.fullName = profile._json.name;
              // Set firstName
              user.general.firstName = profile._json.given_name;
              // Set firstLast
              user.general.lastName = profile._json.family_name;
              // Set profile image
              user.general.profileImage = profile._json.picture;

              // Set veto permissions
              user.permissions.vetosLeft = 1;
              // Set super vote permissions
              user.permissions.superVotesLeft = 2;

              // Set as speaker if email matches speaker
              if(profile._json.email === 'speaker@district01.com'){
                user.permissions.isSpeaker = true;
              }else{
                user.permissions.isSpeaker = false;
              }

              // Add google token
              user.meta.googleAuthToken = token;
              // Add google refresh token
              user.meta.googleRefreshToken = refreshToken;
              // Add verification code
              user.meta.code = Math.random().toString().substr(2, 3);
              // Enable account
              user.meta.enabled = true;

              // Set the user on the session
              req.session.profile = user;

              console.log('- Created new user: ', user.general.email, ' -');

              // Save the user
              return user.save();

            }

          })
          .then(onSuccess = (response) => {

            // Save profile on the session
            req.session.profile = response;

            console.log('- Logged in as: ', response.general.email, ' -');

            return {
              type: "ok",
              data: UserHelper.fillBlueprint(req.session.profile)
            };

          }, PromiseHelper.checkError)
          .then(onSuccess = (response) => {

            ResponseHelper(res, response.type, {
              data: response.data
            });

          });

      }else{

        console.log('Not a District01 profile', profile);

        throw {
          type: "notFound"
        };

      }

    }));

}; */
