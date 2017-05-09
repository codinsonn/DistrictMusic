// Packages
var _ = require("lodash");

require("rootpath")();

var path = require('path');
var fs = require('fs');
var ytdl = require('ytdl-core');

// Helpers
var EmitHelper = require(__base + "app/helpers/io/emitter");
var GridFsHelper = require(__base + "app/helpers/gridfs");

module.exports = (songId, audioFilename, /*songTitle,*/ emitProgress, socketIdsToEmitTo) => {

  if(typeof(emitProgress) === 'undefined') emitProgress = false;
  if(typeof(socketIdsToEmitTo) === 'undefined') socketIdsToEmitTo = [];

  return new Promise((resolve, reject) => {

    var url = `https://www.youtube.com/watch?v=${songId}`;

    let audioFormat = {};
    ytdl.getInfo(songId, (err, info) => {

      if(err) throw err;

      let i = info.formats.length;
      _.forEach(info.formats, format => {

        if(format.type.indexOf('audio/webm') > -1){
          audioFormat = format;
        }

        i--;
        if (i === 0) {

          console.log('[DownloadSong] Downloading song...');

          var readStream = ytdl(url, { quality: 'lowest', format: audioFormat })
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

              });

              res.on('end', () => {

                console.log('-f- Finished downloading song to db:', audioFilename);

                if(emitProgress){
                  EmitHelper.emit('DOWNLOAD_PROGRESS', socketIdsToEmitTo, {percent: 0, str: '100%'});
                }

              });

            })
          ;

          GridFsHelper.upload(readStream, audioFilename, 'audio/webm', 'webm').then((file_id) => {

            console.log('[DownloadSong] UPLOAD SUCCESSFULL:', file_id);

            resolve({ filename: audioFilename, fileId: file_id });

          }, (error) => {

            console.log('[DownloadSong] -!- UPLOAD REJECTED:', error,' -!-');

            reject(error);

          });

        }

      });

    });

  });

};
