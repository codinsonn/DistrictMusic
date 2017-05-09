var RtmClient = require('@slack/client').RtmClient;

//var token = 'xoxb-179607659089-Ije24Kx4UjzbuJuac62auQgJ';

module.exports.init = function(token, logLevel) {

  var rtm = new RtmClient(token, {logLevel: logLevel});
  return rtm;

};
