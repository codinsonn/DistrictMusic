require("rootpath")();

module.exports = {
    production: false,
    logs: true,
    server: {
      port: 3020,
      domain: "http://localhost:3020/",
      frontend: "http://localhost:3020/",
      frontendPath: "public/"
    },
    mongo: {
      db: "district-music-local",
      url: "localhost" //"127.0.0.1:27017"
    },
    session: {
      domain: ""
    },
    auto: {
      resetVetos: 2, // amount of 'vetos left' to reset to every week
      resetSuperVotes: 5, // amount of 'super votes left' to reset to every week
      minVoteScore: -5, // auto delete on further downvote
      minLegacyScore: 5, // available for random additions by cronbot
      minSongsInQueue: 3, // minimum number of songs in queue before auto re adding old ones
      cronPatternCheckSpeakerQueueUpdate: '00 * * * * 1-60/10', // every 10 seconds
      cronPatternCheckQueueEmpty: '00 * * * * 1-60', // every minute
      cronPatternAddRandomSong: '00 00 09 * * 1-5', // every weekday in the morning at 9:00
      cronPatternResetVotes: '00 00 * * * 1-24', // every hour
      cronPatternScheduleFilesToBeRemoved: '00 01 * * * 1-24', // every hour at the first minute
      cronPatternRemoveScheduledFiles: '00 59 * * * 1-24' // every hour at the last minute
    }
};
