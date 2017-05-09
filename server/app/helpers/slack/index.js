var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;

module.exports = (app, slackClient) => {

  console.log('--- [Slack] Initialising slack helpers... ---');

  this.slackClient = slackClient;
  this.slackClient.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => this.onAuthenticated(rtmStartData));
  this.slackClient.on(RTM_EVENTS.MESSAGE, (message) => this.onMessage(message));

  this.onAuthenticated = (rtmStartData) => {

    console.log('-i- [Slack] Logged in as', rtmStartData.self.name, 'of team', rtmStartData.team.name, 'but not yet connected to a channel -i-');

  };

  this.onMessage = (message) => {

    console.log('[DistrictMusicBot] Received message:', message);

  };

  this.slackClient.start();

};
