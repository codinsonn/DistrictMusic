var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;

module.exports = (app, rtmClient, nlpClient) => {

  console.log('--- [Slack] Initialising slack helpers... ---');

  this.districtMusicBot = rtmClient; // Slack
  this.nlpClient = nlpClient; // Natural Language Processor: Wit.ai

  this.districtMusicBot.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => this.onAuthenticated(rtmStartData));
  this.districtMusicBot.on(RTM_EVENTS.MESSAGE, (message) => this.onMessage(message));

  this.onAuthenticated = (rtmStartData) => {

    console.log('-i- [Slack] Logged in as', rtmStartData.self.name, 'of team', rtmStartData.team.name, 'but not yet connected to a channel -i-');

  };

  this.onMessage = (message) => {

    if (message.text.toLowerCase().includes('districtmusicbot')) {

      this.nlpClient.ask(message.text).then(res => {

        try {

          if ( !res.intent || !res.intent[0] || !res.intent[0].value ) {

            throw new Error("Could not extract intent");

          } else {

            var intentList = [];
            for (var i = 0; i < res.intent; i++) {
              intentList.push(intentData.intent.value.toLowerCase());
            }

            let intentToUse = '';
            if (intentList.includes('playlist')) intentToUse = 'playlist';
            if (intentList.includes('speaker')) intentToUse = 'speaker';

            if (intentToUse !== '') {

              let intent = require(__base + 'app/helpers/chatbot/intents/' + intentToUse + 'Intent');
              intent.process(res, intentList).then(responseMessage => {

                return this.districtMusicBot.sendMessage(responseMessage, message.channel);

              }, failMessage => {

                console.log('-!- [DistrictMusicBot] -!- Something went wrong:', failMessage, res.intent);
                return this.districtMusicBot.sendMessage(failMessage, message.channel);

              });

            } else {

              console.log('-!- [DistrictMusicBot] -!- Could not process intent:', res.intent);
              return this.districtMusicBot.sendMessage("Sorry, I didn't understand...", message.channel);

            }

          }

        } catch (err) {

          console.log('[DistrictMusicBot] Error with intent:', err);
          return this.districtMusicBot.sendMessage("Sorry, I didn't understand...", message.channel);

        }

      }, err => {

        console.log('[DistrictMusic] Error processing message:', err);

      });

    }

  };

  this.handleMessage = (message) => {

    if (message.text.indexOf('Hi') > -1 || message.text.indexOf('Hello')) {

      this.districtMusicBot.sendMessage('Hey! How can I help you today?', message.channel, () => {
        console.log('[DistrictMusicBot] Said hello');
      });

    }

  };

  this.districtMusicBot.start();

};
