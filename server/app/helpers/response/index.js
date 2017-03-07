// Packages
var _ = require("lodash");
// Helpers

var messages = require("./messages");

module.exports = function(res, type, options) {

    var response;

    // Check if type exists
    if (messages.hasOwnProperty(type)) {
        // Overwrite response message
        response = _.cloneDeepWith(messages[type]);
    } else {
        // Type is not known, send default message
        if (!res.headersSent) {
            res.status(messages.default.status).json(messages.default.data);
        }
        return;
    }

    // Overwrite response if options are available
    if (options) {
        // Overwrite status if available
        response.status = options.status || response.status;

        // Overwrite data if available
        response.data = options.data || response.data;

        // Overwrite key if available
        if (response.hasOwnProperty("key")) {
            response.key = options.key || response.key;
        }
    }

    var message = response.data;

    if (response.hasOwnProperty("key")) {
        message = {};
        message[response.key] = response.data;
    }

    if (!res.headersSent) {
        res.status(response.status).json(message);
    }

};
