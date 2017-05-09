var RtmClient = require('@slack/client').RtmClient;

module.exports.init = function(token, logLevel) {

  var rtm = new RtmClient(token, {logLevel: logLevel});
  return rtm;

};
