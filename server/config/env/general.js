
module.exports = {
  api: "/api/",
  version: {

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
  contentTypes: [

  ],
  images: [
    "image/jpeg",
    "image/jpg",
    "image/png"
  ],
  privacy: "<p class=\"u-text-center u-text-bold\">Introduction</p>" +
           "<p class=\"u-text-left\">Welcome to our application (the “App“). This App is published by or on behalf of District01 (“District01” or “We” or “Us“) a company registered in Belgium whose registered office at:</p>",
           // TODO: Privacy
  policy:  "<p class=\"u-text-center u-text-bold\">Your privacy is critically important to us.</p>" +
           "<p class=\"u-text-left\">Welcome to our application (the “App“). This App is published by or on behalf of District01 (“District01” or “We” or “Us“) a company registered in Belgium whose registered office at:</p>"
           // TODO: Policy
};
