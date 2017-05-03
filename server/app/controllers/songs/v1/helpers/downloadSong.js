// Packages
var _ = require("lodash");

require("rootpath")();

var path = require('path');
var fs = require('fs');
var ytdl = require('ytdl-core');

// Helpers
var EmitHelper = require(__base + "app/helpers/io/emitter");
var GridFsHelper = require(__base + "app/helpers/gridfs");

module.exports = (songId, songTitle, emitProgress, socketIdsToEmitTo) => {

  if(typeof(emitProgress) === 'undefined') emitProgress = false;
  if(typeof(socketIdsToEmitTo) === 'undefined') socketIdsToEmitTo = [];

  return new Promise((resolve, reject) => {

    var url = `https://www.youtube.com/watch?v=${songId}`;
    var songTitleStripped = songTitle;
    console.log('[DownloadSong] Assigned title:', songTitleStripped);
    songTitleStripped = songTitleStripped.replace(/[^a-zA-Z0-9]/g, '');
    console.log('[DownloadSong] Stripped title:', songTitleStripped);
    var audioFilename = `${songId}_${songTitleStripped}.mp4`;
    console.log('[DownloadSong] Setup file naming for file:', audioFilename);

    console.log('[DownloadSong] Downloading song...');

    var readStream = ytdl(url, { quality: 'lowest', filter: function(f) {
      return f.container === 'mp4' && f.type.indexOf('audio/mp4') > -1;
    } })
      .on('response', (res) => {

        var totalSize = res.headers['content-length'];
        var dataRead = 0;

        res.on('data', (data) => {

          dataRead += data.length;
          var percent = dataRead / totalSize;
          var strPercent = (percent * 100).toFixed(2) + '%';

          if(emitProgress){
            EmitHelper.emit('DOWNLOAD_PROGRESS', socketIdsToEmitTo, {percent: percent, str: strPercent});
          }

          if(process.stdout){
            process.stdout.cursorTo(0);
            process.stdout.clearLine(1);
            process.stdout.write(strPercent);
          }

        });

        res.on('end', () => {

          if(process.stdout){ process.stdout.write('\n'); }

          console.log('-f- Finished downloading song to db:', audioFilename);

          if(emitProgress){
            EmitHelper.emit('DOWNLOAD_PROGRESS', socketIdsToEmitTo, {percent: 0, str: '100%'});
          }

        });

      })
    ;

    GridFsHelper.upload(readStream, audioFilename, 'audio/mp4', 'mp4').then((file_id) => {

      console.log('[DownloadSong] UPLOAD SUCCESSFULL:', file_id);

      resolve({ filename: audioFilename, fileId: file_id });

    }, (error) => {

      console.log('[DownloadSong] -!- UPLOAD REJECTED:', error,' -!-');

      reject(error);

    });

  });

};
