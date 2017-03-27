require("rootpath")();
var config = require(__base + "config");
var UsersController = require(__base + "app/controllers/users/v1");
var SongsController = require(__base + "app/controllers/songs/v1");
var baseUrlUser = "songs/";

module.exports = (app) => {

  /** --- Get current playlist queue -----------------------------------------------------------------------------
   * @api {get} /api/songs/queue/ Search youtube videos
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
   */
  app.route("/api/songs/queue/").get(SongsController.getAllQueued);

  /** --- Add Song to Queue -----------------------------------------------------------------------------
   * @api {post} /api/songs/queue/ Add youtube song to queue
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
   *        "general": {
   *          "id": "youtube-id",
   *          "title": "youtube-title",
   *          "channel": "youtube-channel",
   *          "duration": "song-duration",
   *          "filename": "server-filename"
   *        },
   *        "queue": {
   *          "inQueue": "true/false",
   *          "lastAddedBy": {
   *            "userId": "user-id",
   *            "userName": "user-fullname",
   *            "profileImage": "google-user-profile-image-url"
   *          },
   *          "originallyAddedBy": {
   *            "userId": "user-id",
   *            "userName": "user-fullname",
   *            "profileImage": "google-user-profile-image-url"
   *          },
   *          "votes": {
   *            "currentQueueScore": "current-score",
   *            "legacyScore": "legacy-score"
   *          }
   *        },
   *        "thumbs": {
   *          "default": {
   *            "url": "youtube-thumb-url",
   *            "width": "youtube-thumb-width",
   *            "height": "youtube-thumb-height"
   *          },
   *          "medium": {
   *            "url": "youtube-thumb-url",
   *            "width": "youtube-thumb-width",
   *            "height": "youtube-thumb-height"
   *          },
   *          "high": {
   *            "url": "youtube-thumb-url",
   *            "width": "youtube-thumb-width",
   *            "height": "youtube-thumb-height"
   *          }
   *        }
   *     }
   *
   * @apiUse messageBadRequest
   *
   * @apiUse messageNotFound
   **/
  app.post("/api/songs/queue/", UsersController.userSession.require, SongsController.addSongToQueue);

  /** --- Remove current song from queue -----------------------------------------------------------------------------
   * @api {post} /api/songs/queue/next Vote for song to change ranking
   * @apiDescription Up/Down vote song, return new score
   * @apiGroup Authentication
   * @apiVersion 1.0.0
   *
   * @apiSuccessExample {json} Request-Example:
   *     {
   *       "songId": "youtube id",
   *       "songTitle": "youtube title"
   *     }
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *
   *     }
   *
   * @apiUse messageBadRequest
   *
   * @apiUse messageNotFound
   **/
  app.post("/api/songs/queue/next", UsersController.permissions.requireSpeaker, SongsController.playNext);

  /** --- Vote for song (upvote / downvote / super votes) -----------------------------------------------------------------------------
   * @api {post} /api/songs/queue/vote/ Vote for song to change ranking
   * @apiDescription Up/Down vote song, return new score
   * @apiGroup Authentication
   * @apiVersion 1.0.0
   *
   * @apiSuccessExample {json} Request-Example:
   *     {
   *       "songId": "youtube id",
   *       "songTitle": "youtube title",
   *       "voteType": "vote type"
   *     }
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *
   *     }
   *
   * @apiUse messageBadRequest
   *
   * @apiUse messageNotFound
   **/
  app.post("/api/songs/queue/vote/", UsersController.userSession.require, UsersController.permissions.checkVotesLeft, SongsController.voteSong);

}
