//var elastic = require("../elastic");

module.exports = {
  api: "/api/",
  version: {

  },
  session: {
      name: "D01Music",
      secret: "d1str1ctO1Mus1c1sGr3@t",
      domain: "http://localhost:3020",
      collections: "sessions",
      resave: true,
      saveUninitialized: true,
      cookieExpiration: 604800000 // 1000 * 60 * 60 * 24 * 7
  },
  language: {
      // All languages should be configured here
      config: [{
          key: "enGB",
          name: "English",
          localized: "English"
      }],
      // This is the default language
      default: "enGB"
  },
  //elastic: elastic,
  contentTypes: [

  ],
  images: [
    "image/jpeg",
    "image/jpg",
    "image/png"
  ],
  notifications: {

  },
  reports: {

  },
  strategies: {

  },
  privacy: "<p class=\"u-text-center u-text-bold\">Introduction</p>" +
           "<p class=\"u-text-left\">Welcome to our application (the “App“). This App is published by or on behalf of District01 (“District01” or “We” or “Us“) a company registered in Belgium whose registered office at:</p>",
           // TODO: Privacy
  policy:  "<p class=\"u-text-center u-text-bold\">Your privacy is critically important to us.</p>" +
           "<p class=\"u-text-left\">Welcome to our application (the “App“). This App is published by or on behalf of District01 (“District01” or “We” or “Us“) a company registered in Belgium whose registered office at:</p>",
           // TODO: Policy
  profile: {

  },
  locations: {
    provinces: {
      antwerp: [
        4.747234,
        51.259625
      ],
      eastFlanders: [
        3.801376,
        51.041622
      ]
    }
  }
};
