require("rootpath")();
var _ = require("lodash");
var glob = require("glob");
var path = require("path");
var config = require(__base + "config");

var passport = require("passport");
var PassportHelper = require(__base + "app/helpers/passport");

module.exports = function(app) {

    // Find all route files
    var routes = glob(__base + "app/routes/**/*.js", {
        sync: true
    });

    // Loop over the routes
    _.forEach(routes, (route) => {

        // Exclude this file
        var indexRoute = __base + "app/routes/index.js";

        if (route !== indexRoute) {
            // Require the route file
            require(route)(app);
        }

    });

    // Fallback & non api routes -> React Router routes or 404
    app.route(["/", "/*"]).all( (req, res) => {

      var sess = req.session;

      if(sess.profile){
        console.log('Session Profile', sess.profile);
      }

      res.sendFile(path.join(__dirname, "../../" + config.server.frontendPath + "index.html"));

    });

};
