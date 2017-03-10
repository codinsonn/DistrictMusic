require("rootpath")();
var config = require(__base + "config");
var authConfig = require(__base + "config/auth");
var search = require('youtube-search');
var ytDurationFormat = require('youtube-duration-format');
var xhr = require('xhr');
var baseUrlUser = "youtube/";

if (!xhr.open) xhr = require('request');

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
      maxResults: 15,
      key: authConfig.googleAuth.apiKey,
      safeSearch: 'moderate',
      topicId: '/m/04rlf', // music general
      type: 'video',
      videoDuration: 'any', // 4 - 20 minutes
      videoEmbeddable: true,
      //videoSyndicated: true, // playable outside youtube
      videoCategoryId: 10 // music
    }

    this.searchSuggestions = [];
    this.videoDetails = [];
    this.suggestions = [];
    this.youtubeIds = ''; // comma separated
    this.loopsLeft = 0;

    this.addSuggestion = suggestion => {

      this.searchSuggestions.push(suggestion);
      this.loopsLeft--;

      if(this.loopsLeft === 0){
        this.youtubeIds += `${suggestion.id}`;
        this.addSuggestionDetails();
      }else{
        this.youtubeIds += `${suggestion.id},`;
      }

    }

    this.addSuggestionDetails = () => {

      console.log('-- HIT --');

      var url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${this.youtubeIds}&key=${opts.key}`;

      xhr({ url: url, method: 'GET' }, (err, res, body) => {

        if(err){
          this.respondError(err);
        }else{

          var body = JSON.parse(body);

          var i = 0;
          this.loopsLeft = body.items.length;
          body.items.forEach((vid) => {

            console.log('Text');

            var ytDuration = vid.contentDetails.duration;
            var hmsDuration = ytDurationFormat(ytDuration);

            var duration = hmsDuration;
            switch(hmsDuration.length){

              case 1:
                duration = `00:00:0` + duration;
                break;

              case 2:
                duration = `00:00:` + duration;
                break;

              case 4:
                duration = `00:0` + duration;
                break;

              case 5:
                duration = `00:` + duration;
                break;

              case 7:
                duration = `0` + duration;
                break;

              default:
                duration = hmsDuration;
                break;

            }

            //console.log('Duration: ', ytDuration, ' | ', hmsDuration, ' | ', duration);

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

          });

        }

      });

    }

    this.respondSuggestions = () => {

      //console.log('Suggestions', this.suggestions);
      res.statusCode = 200;
      return res.json(this.suggestions);
      next();

    }

    this.respondError = (err) => {

      console.log(err);
      res.statusCode = 400;
      return res.json({ errors: [ 'No results, try again later' ] });
      next();

    }

    search(req.params.query, opts, (err, results) => {

      if(err){
        this.respondError(err);
      }else if (results.length > 0) {

        this.loopsLeft = results.length;
        results.forEach((suggestion) => {

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

  });

}
