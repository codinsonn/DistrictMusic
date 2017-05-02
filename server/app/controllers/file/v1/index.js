var upload = require("./upload");
var download = require("./download");

module.exports = {
    upload: upload.init,
    download: download.init
};
