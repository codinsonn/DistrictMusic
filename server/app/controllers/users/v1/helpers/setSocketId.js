// Packages
require("rootpath")();

// Helpers
var ObjectId = require(__base + "app/helpers/objectid");
var EmitHelper = require(__base + "app/helpers/io/emitter");

// Models
var UserModel = require(__base + "app/models/user");

module.exports = function(profile, socketId) {

  UserModel.findOne({ 'general.email': profile.general.email, 'meta.googleId': profile.meta.googleId, 'meta.googleAuthToken': profile.meta.googleAuthToken }, (err, user) => {

    if (err){

      //console.log('Error occured while searching user:', err);
      res.statusCode = 500;
      return res.json({
        errors: [
          'Could not search for user'
        ]
      });

    }

    if (user) {

      if(user.meta.socketIds[0] !== socketId){

        //console.log('- [DB][setSocketId] Old user SID in database: ', user.meta.socketIds, ' | new: ', socketId,' -');

        //console.log('--- USER: ---\n', user, '\n --- / USER ---');

        user.meta.socketIds = [socketId];

        // Save the user
        return user.save((err) => {

          if (err)
            throw err;

          //console.log('- [DB][setSocketId] Updated to new SID in database: ', user.meta.socketIds, ' -');
          EmitHelper.emit('UPDATED_SOCKET_ID', user.meta.socketIds, {socketId: user.meta.socketIds[0]});

          UserModel.findOne({ 'general.email': profile.general.email, 'meta.googleId': profile.meta.googleId, 'meta.googleAuthToken': profile.meta.googleAuthToken }, (err, user) => {
            console.log('USER SID:', user.meta.socketIds);
          });

        });

      }

    } else {

      console.log('- Unknown user -');

      res.statusCode = 401;
      return res.json({
        errors: [
          'Unknown user'
        ]
      });

    }

  });

};
