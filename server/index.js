global.__base = __dirname + '/';

// Auto use "local" environment, this is the default environment for development
process.env.NODE_ENV = process.env.NODE_ENV || "local";
if (process.env.NODE_ENV === "local") {
    // Auto clear terminal on restart
    process.stdout.write("\033c");
}

// List of all timezones
// https://www.vmware.com/support/developer/vc-sdk/visdk400pubs/ReferenceGuide/timezone.html
// Set timezone
process.env.TZ = "Etc/GMT";

require("rootpath")();
const path = require(`path`);

// CORS Middleware
var allowCrossDomain = (req, res, next) => {

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Access-Control-Allow-Origin');
  res.header("Access-Control-Max-Age", "86400"); // 24 hours
  res.header("Access-Control-Allow-Credentials", true);

  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.send(200);
  } else {
    next();
  }

}

var express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    morgan = require('morgan'),
    passport = require('passport'),
    session = require('express-session'),
    cors = require('cors'),
    errorHandler = require('errorhandler');

var app = express();
//app.use(allowCrossDomain);
//app.use(cors({credentials: true, origin: true}));
app.use(morgan('dev'));
app.use(errorHandler({dumpExceptions: true, showStack: true}));
app.use(session({
  secret: 'd1str1ctO1Mus1c1sGr3@t',
  resave: true,
  saveUninitialized: true
}));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({type:'application/vnd.api+json'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, './public/')));

var server = require("http").Server(app);
var config = require("./config");
var port = process.env.PORT || config.server.port;

/* --- Start Loading... -------------------------------------------------------------------- */

// Load DB config
require("./app/middleware/db");

// Load all routes
require("./app/routes")(app);

/* --- Start server ------------------------------------------------------------------------ */

server.listen(port, function() {
  console.log("-- DistrictMusic app listening on %s in %s mode. --", port, process.env.NODE_ENV); // eslint-disable-line no-console

  // Load config after server is booted
  //require("app/middleware/start")();
});

process.on('uncaughtException', () => {
  server.close();
});

process.on('SIGTERM', () => {
  server.close();
});

exports = module.exports = server;
