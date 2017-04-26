require("rootpath")();

module.exports = {
    production: true,
    logs: true,
    server: {
      port: 3020,
      domain: "http://localhost:3020/",
      frontend: "http://localhost:3020/",
      frontendPath: "public/"
    },
    /*mongo: {
      db: "district-music-local",
      url: "localhost" //"127.0.0.1:27017"
    },*/
    mongo: {
      admin: 'DistrictMusicAdmin',
      password: 'mus1cadm1n',
      db: 'districtmusic'
    },
    session: {
      domain: ""
    },
    'googleAuth' : {
      'clientID': "988274792144-8f4hj5jj2qja2fagh9stkfe5f8dpfbau.apps.googleusercontent.com",
      'clientSecret': "6RoBvh-aw5nUE4iOnNDHB2TE",
      'callbackURL': 'http://localhost:3020/auth/google/callback',
      'apiKey': 'AIzaSyAh0pqBXb_-QLX92f3WOCiBffHVyYIaMJU'
    },
    auto: {
      resetVetos: 2, // amount of 'vetos left' to reset to every week
      resetSuperVotes: 5, // amount of 'super votes left' to reset to every week
      minVoteScore: -5, // auto delete on further downvote
      minLegacyScore: 0, // available for random additions by cronbot
      minSongsInQueue: 3, // minimum number of songs in queue before auto re adding old ones
      maxRandomBestPool: 20, // maximum number of best songs to choose from for random additions
      cronPatternCheckSpeakerQueueUpdate: '00 * * * * 1-60/10', // every 10 seconds
      cronPatternCheckQueueEmpty: '00 * * * * 1-60', // every minute
      cronPatternAddRandomSong: '00 00 09 * * 1-5', // every weekday in the morning at 9:00
      cronPatternResetVotes: '00 00 * * * 1-24', // every hour
      cronPatternScheduleFilesToBeRemoved: '00 01 * * * 1-24', // every hour at the first minute
      cronPatternRemoveScheduledFiles: '00 59 * * * 1-24', // every hour at the last minute
      cronPatternRemoveUnusedFiles: '00 00 * * * 1-24' // every hour
    }
};
