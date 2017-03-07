module.exports = {
    ok: {
        status: 200,
        data: {}
    },
    created: {
        status: 201,
        data: {}
    },
    /**
     * @apiDefine messageNoContent
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 204 No content
     */
    noContent: {
        status: 204,
        data: {}
    },
    /**
     * @apiDefine messageResetContent
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 205 Reset content
     *     { }
     */
    resetContent: {
        status: 205,
        data: {}
    },
    /**
     * @apiDefine messageBadRequest
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 400 Bad request
     *     {
     *       "err": "Something went wrong."
     *     }
     */
    badRequest: {
        status: 400,
        key: "err",
        data: "Something went wrong."
    },
    /**
     * @apiDefine messageBadRequestRegisterVdab
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 400 Bad request
     *     {
     *       "err": "We were unable to register your account with the VDAB."
     *     }
     */
    badRequestRegisterVdab: {
        status: 400,
        key: "err",
        data: "We were unable to register your account with the VDAB."
    },
    /**
     * @apiDefine messageUnauthorized
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 401 Not authorized
     *     {
     *       "err": "User not authorized."
     *     }
     */
    unauthorized: {
        status: 401,
        key: "err",
        data: "User not authorized."
    },
    /**
     * @apiDefine messagePaymentRequired
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 402 Payment required
     *     {
     *       "err": "Payment required."
     *     }
     */
    paymentRequired: {
        status: 402,
        key: "err",
        data: "Payment required."
    },
    /**
     * @apiDefine messageForbidden
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 403 Forbidden
     *     {
     *       "err": "Forbidden."
     *     }
     */
    forbidden: {
        status: 403,
        key: "err",
        data: "Forbidden. Do NOT repeat request."
    },
    /**
     * @apiDefine messageNotFound
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 404 Not found
     *     {
     *       "err": "Item not found."
     *     }
     */
    notFound: {
        status: 404,
        key: "err",
        data: "Item not found."
    },
    /**
     * @apiDefine messageMethodNotAllowed
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 405 Method not allowed
     *     {
     *       "err": "The method was not allowed."
     *     }
     */
    methodNotAllowed: {
        status: 405,
        key: "err",
        data: "The method was not allowed."
    },
    /**
     * @apiDefine messageConflict
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 409 Conflict
     *     {
     *       "err": "Conflict with the current state."
     *     }
     */
    conflict: {
        status: 409,
        key: "err",
        data: "Conflict with the current state."
    },
    /**
     * @apiDefine messageEmailAlreadyExists
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 409 Conflict
     *     {
     *       "err": "User with this e-mailaddress already exists in the database."
     *     }
     */
    emailAlreadyExists: {
        status: 409,
        key: "err",
        data: "User with this e-mailaddress already exists in the database."
    },
    /**
     * @apiDefine messageEmailAlreadyExistsVdab
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 409 Conflict
     *     {
     *       "err": "User with this e-mailaddress already exists in the database of the VDAB."
     *     }
     */
    emailAlreadyExistsVdab: {
        status: 409,
        key: "err",
        data: "User with this e-mailaddress already exists in the database of the VDAB."
    },
    /**
     * @apiDefine messageThanksAlreadyExists
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 409 Conflict
     *     {
     *       "err": "You have already sent a \"Thank you\" to this person."
     *     }
     */
    thanksAlreadyExists: {
        status: 409,
        key: "err",
        data: "You have already sent a \"Thank you\" to this person."
    },
    /**
     * @apiDefine messagePreconditionFailed
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 412 Precondition failed
     *     {
     *       "err": "We did not receive everything as expected."
     *     }
     */
    preconditionFailed: {
        status: 412,
        key: "err",
        data: "We did not receive everything as expected."
    },
    /**
     * @apiDefine messageContentTypeUnkown
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 412 Precondition failed
     *     {
     *       "err": "We did not receive everything as expected."
     *     }
     */
    contentTypeUnkown: {
        status: 412,
        key: "err",
        data: "The content type was missing or is unknown."
    },
    /**
     * @apiDefine messageDistanceTooHigh
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 412 Precondition failed
     *     {
     *       "err": "Please enter a lower distance value."
     *     }
     */
    distanceTooHigh: {
        status: 412,
        key: "err",
        data: "Please enter a lower distance value."
    },
    /**
     * @apiDefine messagePasswordNotValid
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 412 Precondition failed
     *     {
     *       "err": "The password was not valid. Please enter at least 8 characters, one uppercase letter, one lowercase letter and one number. Only the following special charachters are allowed \".\", \"-\" and \"_\"."
     *     }
     */
    passwordNotValid: {
        status: 412,
        key: "err",
        data: "The password was not valid. Please enter at least 8 characters, one uppercase letter, one lowercase letter and one number. Only the following special charachters are allowed \".\", \"-\" and \"_\"."
    },
    /**
     * @apiDefine messageMediaType
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 415 Unsupported media type
     *     {
     *       "err": "Media type is not supported."
     *     }
     */
    mediaType: {
        status: 415,
        key: "err",
        data: "Media type is not supported."
    },
    /**
     * @apiDefine messageFailedDependency
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 424 Failed dependency
     *     {
     *       "err": "The method could not be performed on the resource because the requested action depended on another action and that action failed."
     *     }
     */
    failedDependency: {
        status: 424,
        key: "err",
        data: "The method could not be performed on the resource because the requested action depended on another action and that action failed."
    },
    /**
     * @apiDefine messageTooManyRequests
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 429 Too many requests
     *     {
     *       "err": "You have sent to many requests in a given amount of time."
     *     }
     */
    tooManyRequests: {
        status: 429,
        key: "err",
        data: "You have sent to many requests in a given amount of time."
    },
    serverError: {
        status: 500,
        key: "err",
        data: "Internal Server Error."
    },
    routeNotConfigured: {
        status: 501,
        key: "err",
        data: "Route currently not configured. This should redirect to the front-end in the future."
    },
    serviceUnavailable: {
        status: 503,
        key: "err",
        data: "Service Unavailable."
    },
    default: {
        status: 501,
        key: "err",
        data: "Error type not implemented. Did you use the correct key?"
    }
};
