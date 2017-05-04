// Packages
require("rootpath")();
var onFinished = require('on-finished');
var parseRange = require('range-parser');

// Helpers
var GridFS = require(__base + "app/middleware/gridfs");
var exists = require("./exists");
var ObjectId = require(__base + "app/helpers/objectid");

module.exports = (req, res, id) => {

    exists(id)
        .then(onSuccess = (file) => {

            console.log('--- [Download] Starting stream to front-end ---');

            var stream;

            var len = file.length;

            res.setHeader("Content-Type", file.metadata.mimetype);
            res.setHeader("Content-Length", len);
            res.setHeader("Accept-Ranges", 'bytes');

            console.log('[Download] Header set for streaming file');

            if (req.headers.range) {

              console.log('[Download] Requested range');

              var ranges = parseRange(len, req.headers.range, { combine: true });

              if (ranges === -1) {

                console.log('[Download] Streaming from range (1)');

                res.setHeader('Content-Length', 0);
                res.setHeader('Content-Range', this.contentRange('bytes', len));
                res.statusCode = 416;

                console.log('-/- [Download] Stream ended? -/-');
                return res.end();

              }

              if (ranges !== -2 && ranges.length === 1) {

                console.log('[Download] Streaming from range (2)');

                res.statusCode = 206;

                res.setHeader('Content-Range', this.contentRange('bytes', len, ranges[0]));
                len = ranges[0].end - ranges[0].start + 1;
                res.setHeader('Content-Length', len);
                if (req.method === 'HEAD') return res.end();

                //stream = GridFS.gfs.createReadStream({ _id: ObjectId(id) });
                GridFS.gfs.createReadStream({ _id: ObjectId(id) }, (err, readStream) => {
                  stream = readStream;
                  stream.pipe(res);
                  return stream;
                });

              }

            } else {

              console.log('[Download] Streaming without range');

              if (req.method === 'HEAD') return res.end();

              //stream = GridFS.gfs.createReadStream({ _id: ObjectId(id) });
              GridFS.gfs.createReadStream({ _id: ObjectId(id) }, (err, readStream) => {
                stream = readStream;
                stream.pipe(res);
                return stream;
              });

            }

            onFinished(res, () => {
              console.log('-/- [Download] Stream ended and destroyed -/-');
              //if(stream) stream.destroy();
            });

        }, onError = () => {

            console.log('[Download] -!- File not found / in db -!-');

        })
    ;

    this.contentRange = (type, size, range) => {
      return type + ' ' + (range ? range.start + '-' + range.end : '*') + '/' + size;
    }

};
