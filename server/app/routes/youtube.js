require("rootpath")();
var config = require(__base + "config");
var authConfig = require(__base + "config/auth");
var search = require('youtube-search');
var baseUrlUser = "youtube/";

module.exports = (app) => {

  /** --- Search Videos -----------------------------------------------------------------------------
   * @api {get} /api/youtube/search/{query} Search youtube videos
   * @apiDescription Return search results
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
  app.route("/api/youtube/search/:query").get((req, res, next) => {

    var opts = {
      maxResults: 8,
      key: authConfig.googleAuth.apiKey,
      safeSearch: 'moderate',
      topicId: '/m/04rlf', // music general
      type: 'video',
      videoDuration: 'short', // 4 - 20 minutes
      videoEmbeddable: true,
      //videoSyndicated: true, // play outside youtube
      videoCategoryId: 10 // music
    }

    search(req.params.query, opts, (err, results) => {

      if(err){

        console.log(err);

        res.statusCode = 400;
        return res.json({
          errors: [
            'No results, try again later'
          ]
        });

        next();

      }else{

        //console.log(results);

        var suggestions = [];
        results.forEach((suggestion) => {
          if(suggestion.kind === 'youtube#video'){
            suggestions.push(suggestion);
          }
        });

        res.statusCode = 200;
        return res.json(suggestions);

        next();

      }

    });

  });

}
