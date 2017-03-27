// Packages
require("rootpath")();
var _ = require("lodash");

var EmitHelper = require(__base + "app/helpers/io/emitter");

var UserModel = require(__base + "app/models/user");
var SpeakerModel = require(__base + "app/models/speaker");

module.exports.requireSpeaker = (req, res, next) => {

  /*console.log('[CHECK] Session:', req.session);

  if(req.session.speaker && req.session.speaker.meta.socketIds.length > 0){

    SpeakerModel.findOne().exec((err, speaker) => {

      if(err){
        console.log('-!- [SPEAKER] Error whilst searching for speaker -!-');
        res.statusCode = 500;
        return done(null, res.json({ error: err }));
      }

      if(speaker && speaker.meta.socketIds.length >= 1 && speaker.meta.socketIds[0] === req.session.speaker.meta.socketIds[0]){

        console.log('[SPEAKER] Speaker confirmed');

        next();

      }else{

        console.log('- Speaker not verified -');

        delete req.session.speaker;
        res.statusCode = 401;
        return res.json({
          errors: [
            'Speaker not verified'
          ]
        });

        next();

      }

    });

  }else{

    console.log('- Speaker not in session -');

    res.statusCode = 401;
    return res.json({
      errors: [
        'Action reserved for speaker'
      ]
    });

    next();

  }*/

}

module.exports.checkVotesLeft = (req, res, next) => {

  if (req.session.profile) {

    var profile = req.session.profile;

    UserModel.findOne({ 'general.email': profile.general.email, 'meta.googleId': profile.meta.googleId, 'meta.googleAuthToken': profile.meta.googleAuthToken }, (err, user) => {

      if (err){

        console.log('Error occured while searching user:', err);
        res.statusCode = 500;
        res.json({
          errors: [
            'Could not search for user'
          ]
        });

        next();

      }

      if (user) {

        var voteType = req.body.voteType;

        switch(voteType){

          case "veto_upvote":
          case "veto_downvote":
            if(user.permissions.vetosLeft > 0){
              user.permissions.vetosLeft = 0;
              user.save((err) => {

                if (err) {

                  console.log('-!- Error occured while updating vetos left: -!-\n', err, '\n-!-');
                  res.statusCode = 500;
                  return res.json({
                    errors: [
                      'Could not update vetos left'
                    ]
                  });

                }else{

                  console.log('Updated Veto Votes Left:', user.permissions.vetosLeft);
                  req.session.profile = user;
                  EmitHelper.emit('PROFILE_UPDATED', user.meta.socketIds, user);
                  next();

                }

              });
            }else{
              res.statusCode = 412;
              return res.json({
                errors: [
                  'No vetos left'
                ]
              });
            }
            break;

          case "super_upvote":
          case "super_downvote":
            if(user.permissions.superVotesLeft > 0){
              user.permissions.superVotesLeft = user.permissions.superVotesLeft - 1;
              user.save((err) => {

                if (err) {

                  console.log('-!- Error occured while updating super votes left: -!-\n', err, '\n-!-');
                  res.statusCode = 500;
                  return res.json({
                    errors: [
                      'Could not update super votes left'
                    ]
                  });

                }else{

                  console.log('Updated Super Upvotes Left:', user.permissions.superVotesLeft);
                  req.session.profile = user;
                  EmitHelper.emit('PROFILE_UPDATED', user.meta.socketIds, user);
                  next();

                }

              });
            }else{
              res.statusCode = 412;
              return res.json({
                errors: [
                  'No super votes left'
                ]
              });
            }
            break;

          default:
            next();
            break;

        }

      } else {

        console.log('- Unknown user -');

        res.statusCode = 401;
        res.json({
          errors: [
            'Unknown user'
          ]
        });

        next();

      }

    });

  } else {

    console.log('- Profile not in session -');

    res.statusCode = 401;
    res.json({
      errors: [
        'No user in session'
      ]
    });

    next();

  }

};
