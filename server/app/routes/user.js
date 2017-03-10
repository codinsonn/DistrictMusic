require("rootpath")();
var config = require(__base + "config");
var authConfig = require(__base + "config/auth");
var passport = require("passport");
var UsersController = require(__base + "app/controllers/users/v1");
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
//var GoogleStrategy = require('passport-google-oauth20').Strategy;
var PassportHelper = require(__base + "app/helpers/passport");
var baseUrlUser = "user/";

module.exports = (app) => {

  passport.serializeUser((user, done) => {
    //console.log('SerialisedUser', user);
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    //console.log('DeserialisedUser', user);
    done(null, user);
  });

  passport.use(new GoogleStrategy({
    clientID: authConfig.googleAuth.clientID,
    clientSecret: authConfig.googleAuth.clientSecret,
    callbackURL: authConfig.googleAuth.callbackURL,
    passReqToCallback: true
  }, (req, token, refreshToken, profile, done) => PassportHelper.auth(req, token, refreshToken, profile, done)));/**/

  /** --- Login User -----------------------------------------------------------------------------
   * @api {get} /auth/user/google Log user in
   * @apiDescription Log a user in based on e-mail and google+ oauth token.
   * @apiGroup Authentication
   * @apiVersion 1.0.0
   *
   * @apiParamExample {json} Request-Example:
   *     {
   *       "email": "name@district01.com",
   *       "googleToken": "googleToken"
   *     }
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "general":{
   *          "fullName": "fullName",
   *          "firstName": "firstName",
   *          "lastName": "lastName"
   *       }
   *     }
   *
   * @apiUse messageBadRequest
   *
   * @apiUse messageNotFound
   */
  app.get("/auth/user/google", UsersController.userSession.check, passport.authenticate('google', { scope : ['profile', 'email'], hostedDomain: 'district01.be' }));
  app.get("/auth/google/callback", passport.authenticate('google', {
    successRedirect: '/hello',
    failureRedirect: '/fail'
  }));

  /** --- User Session -----------------------------------------------------------------------------
   * @api {get} /auth/user/session Get user session
   * @apiDescription Log the user out, all protected call's will be unavailable.
   * @apiGroup Authentication
   * @apiVersion 1.0.0
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     { }
   *
   * @apiUse messageUnauthorized
   */
  app.route("/api/sess/profile").get(UsersController.userSession.returnProfile);

  /** --- Logout User -----------------------------------------------------------------------------
   * @api {get} /auth/user/logout Logout the user
   * @apiDescription Log the user out, all protected call's will be unavailable.
   * @apiGroup Authentication
   * @apiVersion 1.0.0
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     { }
   *
   * @apiUse messageUnauthorized
   */
  app.route("/auth/user/logout").get(PassportHelper.logout);
  app.route("/logout").get(PassportHelper.logout);

}
