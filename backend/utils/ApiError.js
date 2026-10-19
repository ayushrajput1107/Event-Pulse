class ApiError extends Error {
    constructor(statusCode, message){
        super(message);

        this.statusCode = statusCode;
        this.success = false;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ApiError;