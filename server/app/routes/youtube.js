require("rootpath")();
var _ = require("lodash");

var config = require(__base + "config");
var search = require('youtube-search');
var ytDurationFormat = require('youtube-duration-format');
var xhr = require('xhr');

var UsersController = require(__base + "app/controllers/users/v1");

var baseUrlUser = "youtube/";

if (!xhr.open) xhr = require('request');

module.exports = (app) => {

  /** --- Search Videos -----------------------------------------------------------------------------
   * @api {get} /api/youtube/search/{query} Search youtube videos
   * @apiDescription Return search results
   * @apiGroup Authentication
   * @apiVersion 1.0.0
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
  app.route("/api/youtube/search/:query").get(UsersController.userSession.require, (req, res, next) => {

    var opts = {
      maxResults: 30,
      key: config.googleAuth.apiKey,
      safeSearch: 'moderate',
      topicId: '/m/04rlf', // music general
      type: 'video',
      videoDuration: 'any', // 4 - 20 minutes
      videoEmbeddable: true,
      videoSyndicated: true, // playable outside youtube
      videoCategoryId: 10 // music
    }

    this.searchSuggestions = [];
    this.videoDetails = [];
    this.suggestions = [];
    this.youtubeIds = ''; // build comma separated
    this.loopsLeft = 0;

    this.addSuggestion = suggestion => {

      this.searchSuggestions.push(suggestion);
      this.loopsLeft--;

      if(this.loopsLeft !== 0){
        this.youtubeIds += `${suggestion.id},`;
      }else{
        this.youtubeIds += `${suggestion.id}`;
        this.addSuggestionDetails();
      }

    }

    this.addSuggestionDetails = () => {

      var url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${this.youtubeIds}&key=${opts.key}`;

      xhr({ url: url, method: 'GET' }, (err, res, body) => {

        if(err){
          this.respondError(err);
        }else{

          var body = JSON.parse(body);

          var i = 0;
          this.loopsLeft = 0;
          if(body.items) { this.loopsLeft = body.items.length; }

          _.forEach(body.items, (vid) => {

            if(this.searchSuggestions[i]){

              var duration = this.normalizeDuration(vid.contentDetails.duration);

              if(duration < '00:08:00'){
                duration = duration.substring(3, 8);
                this.searchSuggestions[i].duration = duration;
                this.suggestions.push(this.searchSuggestions[i]);
              }

              i++;
              this.loopsLeft--;

              if(this.loopsLeft === 0){
                this.respondSuggestions();
              }

            }

          });

        }

      });

    }

    this.respondSuggestions = () => {

      if (this.suggestions.length >= 1) {

        res.statusCode = 200;
        //return res.json(this.suggestions);
        res.json(this.suggestions);
        //next();

      } else {

        this.respondError('-!- [Youtube] -!- No results found -!-');

      }

    }

    this.respondError = (err) => {

      console.log(err);
      res.statusCode = 400;
      //return res.json({ errors: [ 'No results, try again later' ] });
      res.json({ errors: [ 'No results, try again later' ] });
      //next();

    }

    search(req.params.query, opts, (err, results) => {

      if(err){
        this.respondError(err);
      }else if (results.length > 0) {

        this.loopsLeft = results.length;

        _.forEach(results, (suggestion) => {

          if(suggestion.kind === 'youtube#video'){
            this.addSuggestion(suggestion);
          }else{
            this.loopsLeft--;
          }

        });

      }else{
        this.suggestions = [];
        this.respondSuggestions();
      }

    });

    this.normalizeDuration = ytDuration => {

      var hmsDuration = ytDurationFormat(ytDuration);
      var duration = hmsDuration;

      switch(hmsDuration.length){

        case 1:
          duration = `00:00:0` + hmsDuration;
          break;

        case 2:
          duration = `00:00:` + hmsDuration;
          break;

        case 4:
          duration = `00:0` + hmsDuration;
          break;

        case 5:
          duration = `00:` + hmsDuration;
          break;

        case 7:
          duration = `0` + hmsDuration;
          break;

        default:
          duration = hmsDuration;
          break;

      }

      return duration;

    }

  });

}
