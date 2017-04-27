require("rootpath")();

module.exports = {
    production: true,
    logs: false,
    server: {
      port: 3020,
      domain: "https://districtmusic.herokuapp.com/",
      frontend: "https://districtmusic.herokuapp.com/",
      frontendPath: "public/"
    },
    mongo: {
      admin: 'DistrictMusicAdmin',
      password: 'mus1cadm1n',
      db: 'districtmusic'
    },
    session: {
      name: "D01Music",
      secret: "d1str1ctO1Mus1c1sGr3@t",
      domain: "districtmusic.herokuapp.com",
      collections: "sessions",
      resave: true,
      saveUninitialized: true,
      cookieExpiration: 604800000 // 1000 * 60 * 60 * 24 * 7
    },
    'googleAuth' : {
      'clientID': "988274792144-8f4hj5jj2qja2fagh9stkfe5f8dpfbau.apps.googleusercontent.com",
      'clientSecret': "6RoBvh-aw5nUE4iOnNDHB2TE",
      'callbackURL': 'https://districtmusic.herokuapp.com/auth/google/callback',
      'apiKey': 'AIzaSyAh0pqBXb_-QLX92f3WOCiBffHVyYIaMJU'
    },
    'whitelistedEmails': [
      'thorrstevens@gmail.com',
      'shaunie1993@msn.com',
      'niels.bril@gmail.com'
    ],
    auto: {
      resetVetos: 1, // amount of 'vetos left' to reset to every week
      resetSuperVotes: 2, // amount of 'super votes left' to reset to every week
      minVoteScore: -10, // auto delete on downvote
      minLegacyScore: 0, // available for random additions by cronbot
      minSongsInQueue: 3, // minimum number of songs in queue before auto re adding old ones
      maxRandomBestPool: 20, // maximum number of best songs to choose from for random additions (Best = DESC > legacyScore)
      cronPatternCheckSpeakerQueueUpdate: '00 * * * * 1-60/10', // every 10 seconds
      cronPatternCheckQueueEmpty: '00 * * * * 1-60', // every minute
      cronPatternAddRandomSong: '00 00 09 * * 1-5', // every weekday in the morning
      cronPatternResetVotes: '00 00 07 * * 1', // every monday morning at 7:00
      cronPatternCheckAudioRemovable: '00 00 22 * * 7', // every sunday night at 22:00
      cronPatternScheduleFilesToBeRemoved: '00 00 23 * * 7', // every sunday night at 23:00
      cronPatternRemoveScheduledFiles: '00 00 06 * * 1', // every monday morning at 6:00
      cronPatternRemoveUnusedFiles: '00 05 07 * * 1' // every monday morning at 7:05
    }
};
