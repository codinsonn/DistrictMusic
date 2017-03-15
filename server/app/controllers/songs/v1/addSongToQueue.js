// Packages
require("rootpath")();
var _ = require("lodash");

var path = require('path');
var fs = require('fs');
var fse = require('fs-extra');
var ytdl = require('ytdl-core');
//var ytdl = require('youtube-dl');
var ffmpeg = require('fluent-ffmpeg');

var EmitHelper = require(__base + "app/helpers/io/emitter");

// Models
var SongModel = require(__base + "app/models/song");
var UserModel = require(__base + "app/models/user");

module.exports = (req, res, done) => {

  this.suggestion = req.body;
  this.profile = req.session.profile;
  this.filename = "";

  SongModel.findOne({ 'general.id': this.suggestion.id, "general.title": this.suggestion.title }, (err, song) => {

    if (err){

      console.log('-!- Error occured while searching for song: -!-\n', err, '\n-!-');
      res.statusCode = 500;
      return res.json({
        errors: [
          'Could not search for song'
        ]
      });

    }

    if (song) { // song exists in db

      console.log('- Found Song: - \n', song);

      if(song.queue.inQueue){ // song still in queue

        console.log('-!- Song already in queue -!-');
        res.statusCode = 412;
        return res.json({
          errors: [
            'Song already in queue'
          ]
        });

      }else{ // song no longer in queue

        // update last submitter
        song.queue.lastAddedBy.userId = this.profile._id;
        console.log('userId', this.profile._id);
        song.queue.lastAddedBy.userName = this.profile.general.fullName;
        song.queue.lastAddedBy.profileImage = this.profile.general.profileImage;
        song.queue.lastAddedBy.added = (new Date()).getTime();

        // reset queue score
        song.queue.votes.currentQueueScore = 0;

        // put back in queue
        song.queue.inQueue = true;

        // Save the song to put back in queue
        return song.save((err) => {

          if (err) {

            console.log('-!- Error occured while updating song: -!-\n', err, '\n-!-');
            res.statusCode = 500;
            return res.json({
              errors: [
                'Could not update song'
              ]
            });

          }

          console.log('- Song re added to queue -');
          res.statusCode = 200;
          return res.json(song);

        });

      }

    } else { // create new song to add to queue

      console.log('- Creating new song from suggestion -');

      var url = `https://www.youtube.com/watch?v=${this.suggestion.id}`;
      var tempFolder = `${__base}uploads/temp/`;
      var audioFolder = `${__base}uploads/audio/`;
      var audioFilename = `${this.suggestion.id}${Math.random().toString().substr(2, 3)}.mp4`;
      var tempOutput = path.resolve(tempFolder, audioFilename);
      var audioOutput = path.resolve(audioFolder, audioFilename);

      console.log('Attempting to save video as song in: ', tempOutput);

      ytdl(url, { filter: (f) => { return f.container === 'mp4' && !f.encoding; }})
        .on('response', (res) => {
          var totalSize = res.headers['content-length'];
          var dataRead = 0;
          res.on('data', (data) => {
            dataRead += data.length;
            var percent = dataRead / totalSize;
            var strPercent = (percent * 100).toFixed(2) + '%';
            UserModel.findOne({ 'general.email': this.profile.general.email, 'meta.googleId': this.profile.meta.googleId, 'meta.googleAuthToken': this.profile.meta.googleAuthToken }, (err, user) => {
              EmitHelper.emit('DOWNLOAD_PROGRESS', user.meta.socketIds, {percent: percent, str: strPercent});
            });
            process.stdout.cursorTo(0);
            process.stdout.clearLine(1);
            process.stdout.write(strPercent);
          });
          res.on('end', () => {
            process.stdout.write('\n');
            fse.copySync(tempOutput, audioOutput);
            fse.copySync(audioOutput, path.resolve(`${__base}public/assets/audio/`, audioFilename));
            fs.unlinkSync(tempOutput);
            console.log('-f- Finished downloading song to:', audioOutput);
            UserModel.findOne({ 'general.email': this.profile.general.email, 'meta.googleId': this.profile.meta.googleId, 'meta.googleAuthToken': this.profile.meta.googleAuthToken }, (err, user) => {
              EmitHelper.emit('DOWNLOAD_DONE', user.meta.socketIds, {percent: 0});
            });
            this.filename = audioFilename;
            this.finishedDownload();
          });
        })
        .pipe(fs.createWriteStream(tempOutput))
      ;

    }

  });

  this.finishedDownload = () => {

    console.log('Download finished');

    /*res.statusCode = 200;
    return res.json({
      success: [
        'Saved the song',
        this.filename
      ]
    });*/

    this.saveToDb();

  }

  this.saveToDb = () => {

    var newSong = new SongModel();

    console.log('Adding filename');
    newSong.general.filename = this.filename;

    // -- general info ---------
    console.log('Adding youtube id');
    newSong.general.id = this.suggestion.id;

    console.log('Adding youtube title');
    newSong.general.title = this.suggestion.title;

    console.log('Adding youtube channel');
    newSong.general.channel = this.suggestion.channel;

    console.log('Adding youtube duration');
    newSong.general.duration = this.suggestion.duration;

    // -- queue info ------------
    console.log('Setting user to original uploader');
    newSong.queue.originallyAddedBy.userId = this.profile._id;
    console.log('userId', this.profile._id);
    newSong.queue.originallyAddedBy.userName = this.profile.general.fullName;
    newSong.queue.originallyAddedBy.profileImage = this.profile.general.profileImage;
    newSong.queue.originallyAddedBy.added = (new Date()).getTime();
    newSong.queue.lastAddedBy = newSong.queue.originallyAddedBy;

    console.log('Setting votes to default values');
    newSong.queue.votes.legacyScore = 0;
    newSong.queue.votes.currentQueueScore = 0;

    // -- thumbs info ---------
    console.log('Adding thumbnails');
    newSong.thumbs = this.suggestion.thumbs;

    // -- Save to queue / db --
    console.log('Adding to queue');
    newSong.queue.inQueue = true;

    res.statusCode = 200;
    return res.json({newSong});/**/

    // Save the song to put back in queue
    /*return newSong.save((err) => {

      if (err) {

        console.log('-!- Error occured while saving new song: -!-\n', err, '\n-!-');
        res.statusCode = 500;
        return res.json({
          errors: [
            'Could not save song'
          ]
        });

      }

      console.log('- New song added to queue -');
      res.statusCode = 200;
      return res.json(newSong);

    });/**/

  }

};
