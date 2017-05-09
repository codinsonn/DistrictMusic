var RtmClient = require('@slack/client').RtmClient;

//var token = 'xoxb-179607659089-hsVK2nIbGqJnLzIK6K57YReS';

module.exports.init = function(token, logLevel) {

  console.log('[Slack] Token:', token, '| logLevel:', logLevel);

  var rtm = new RtmClient(token, {logLevel: logLevel});
  return rtm;

};
