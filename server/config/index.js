require("rootpath")();
var _ = require("lodash");

module.exports = _.merge(
    require(__dirname + "/env/general.js"),
    require(__dirname + "/env/" + process.env.NODE_ENV + ".js" || {})
);
