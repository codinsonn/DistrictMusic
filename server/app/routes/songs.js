require("rootpath")();
var config = require(__base + "config");
var UsersController = require(__base + "app/controllers/users/v1");
var SongsController = require(__base + "app/controllers/songs/v1");
var baseUrlUser = "songs/";

module.exports = (app) => {

  /** --- Stream audio file -----------------------------------------------------------------------------
   * @api {get} /stream/audio/{{filename}} Download file (stream audioBlobs)
   * @apiDescription Stream file to the frontend. Authentication not required.
   * @apiVersion 1.0.0
   * @apiGroup File
   * @apiParam {String} GridFs previous filename
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *
   */
  app.route("/stream/audio/:filename").get(SongsController.getAudioFile);

  /** --- Stream visualisation (bars / waveform) ---------------------------------------------------------
   * @api {get} /stream/audio/visuals/{{filename}} Download file (stream imageBlob)
   * @apiDescription Stream file to the frontend. Authentication not required.
   * @apiVersion 1.0.0
   * @apiGroup File
   * @apiParam {String} Filename as MongoDb id
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *
   */
  app.route("/stream/audio/visuals/:filename").get(SongsController.getAudioVisualisation);

  /** --- Get current playlist queue --------------------------------------------------------------------
   * @api {get} /api/songs/queue/
   * @apiDescription Return current queue
   * @apiGroup Songs
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
  app.get("/api/songs/queue/", SongsController.getAllQueued);

  /** --- Add Song to Queue -----------------------------------------------------------------------------
   * @api {post} /api/songs/queue/ Add youtube song to queue
   * @apiDescription Add song to db and current queue
   * @apiGroup Songs
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
   *        },
   *        "audio": {
   *          "filename": "server-filename",
   *          "isDownloaded": true/false,
   *          "scheduledForRemoval": true/false,
   *          "audioRemovable": true/false
   *        }
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
   *        },
   *        "votes": {
   *          "currentQueueScore": "current-score",
   *          "legacyScore": "legacy-score"
   *        }
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
   * @api {post} /api/songs/queue/next Play next song
   * @apiDescription End current song by removing it from the queue so the next in line starts playing
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

  /** --- Post audiofile -----------------------------------------------------------------------------
   * @api {post} /assets/audioo/{{filename}} Download file
   * @apiDescription Stream file to the frontend. Authentication not required.
   * @apiVersion 1.0.0
   * @apiGroup File
   * @apiParam {String} id MongoDB id of the file.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *
   */
  app.post("/api/songs/:song_id/:type", SongsController.saveAudioVisualisation);

}
