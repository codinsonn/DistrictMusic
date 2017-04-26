var session = require("express-session");
var config = require(__base + "config");

// Set express session settings
module.exports = session({
    saveUninitialized: true,
    resave: true,
    cookie: {
        secure: false,
        httpOnly: false,
        domain: config.session.domain,
        maxAge: config.session.cookieExpiration
    },
    name: config.session.name,
    secret: config.session.secret
});
