// Packages
var request = require('superagent');

// Config
var config = require(__base + "config");

module.exports.witClient = (token) => {

  console.log('--- [Wit] Initialising wit client... ---');

  this.ask = (message) => {

    return new Promise((resolve, reject) => {

      request.get('https://api.wit.ai/message')
        .set('Authorization', `Bearer ${token}`)
        .query({ v: config.chatbot.witQueryV })
        .query({ q: message })
        .end((err, res) => {

          if (err) reject(err);
          if (res.statusCode !== 200) reject(`Expected status 200 but got ${res.statusCode}`);

          resolve(res.body.entities);

        })
      ;

    });

    console.log('[WitClient] Ask:', message);

  }

  return {
    ask: this.ask
  };

};
