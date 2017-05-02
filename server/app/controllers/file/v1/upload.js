// Packages
require("rootpath")();

// Helpers
var ResponseHelper = require(__base + "app/helpers/response");
var GridFSHelper = require(__base + "app/helpers/gridfs");

module.exports.init = function(req, res) {

    GridFSHelper.upload(req)
        .then(function onSuccess(response) {

            ResponseHelper(res, "ok", {
                data: {
                    id: response
                }
            });

        }, function onError(responseError) {

            // Close the connection of the upload completely
            console.log('-!- ERROR WHILE UPLOADING SONG -!-');
            /*ResponseHelper(res, responseError.type, {
                data: responseError.data
            });*/

        })
    ;

};
