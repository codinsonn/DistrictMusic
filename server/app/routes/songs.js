require("rootpath")();
var config = require(__base + "config");
var UsersController = require(__base + "app/controllers/users/v1");
//var authConfig = require(__base + "config/auth");
//var search = require('youtube-search');
//var ytDurationFormat = require('youtube-duration-format');
//var xhr = require('xhr');
var baseUrlUser = "songs/";

//if (!xhr.open) xhr = require('request');

module.exports = (app) => {

  /** --- Add Song to Queue -----------------------------------------------------------------------------
   * @api {post} /api/songs/queue/ Search youtube videos
   * @apiDescription Return search results
   * @apiGroup Authentication
   * @apiVersion 1.0.0
   *
   * @apiSuccessExample {json} Request-Example:
   *     {
   *       "id": "youtube id",
   *       "title": "youtube title",
   *       "channel": "youtube channel",
   *       "thumbs": {},
   *       "duration": "MM:SS",
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
  app.post("/api/songs/queue/", UsersController.userSession.require, (req, res, next) => {

    console.log('Suggestion to Add:', req.body);

  });
  /*app.route("/api/youtube/search/:query").get((req, res, next) => {



  });*/

}
