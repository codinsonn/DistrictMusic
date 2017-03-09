require("rootpath")();
var config = require(__base + "config");
var authConfig = require(__base + "config/auth");
var search = require('youtube-search');
var baseUrlUser = "youtube/";

module.exports = (app) => {

  /** --- Search Videos -----------------------------------------------------------------------------
   * @api {get} /api/youtube/{query} Search youtube videos
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
      topicId: '/m/04rlf',
      type: 'video',
      videoDuration: 'medium',
      videoEmbeddable: true,
      videoSyndicated: true
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

        res.statusCode = 200;
        return res.json(results);

        next();

      }

    });

  });

}
