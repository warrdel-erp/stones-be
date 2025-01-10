// Structure for response with error
export const ErrorResponse = (res, statusCode, message, errorObj) => {
    return res.status(statusCode).json({success: false, message, errors: errorObj});
}


// Structure for response with success.
export const SuccessResponse = (res, statusCode, message, data) => {
    return res.status(statusCode).json({success: true, message, data});
}