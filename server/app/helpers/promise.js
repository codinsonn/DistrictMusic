// Packages
var _ = require("lodash");

// Throw error
var throwError = function(responseError) {
    if (responseError.hasOwnProperty("message")) {
        responseError = responseError.message;
        if (_.isString(responseError)) {
            try {
                responseError = JSON.parse(responseError);
            } catch (e) {
                responseError = responseError;
            }
        }
    }
    throw new Error(JSON.stringify(responseError));
};

module.exports.throwError = throwError;

// Return badRequest
var badRequest = function(responseError) {
    return {
        type: "badRequest",
        data: responseError
    };
};

module.exports.badRequest = badRequest;

// Check and return error
var checkError = function(responseError) {
    try {
        responseError = responseError.message || responseError;
        responseError = JSON.parse(responseError);
    } catch (e) {
        responseError = responseError;
    }

    if (responseError.hasOwnProperty("type")) {
        return {
            type: responseError.type,
            data: responseError.data
        };
    } else {
        return {
            type: "badRequest",
            data: responseError
        };
    }
};

module.exports.checkError = checkError;

// Return ok
var ok = function(response) {
    return {
        type: "ok",
        data: response
    };
};

module.exports.ok = ok;
