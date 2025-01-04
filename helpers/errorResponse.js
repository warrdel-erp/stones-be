export const ErrorResponse = (res, statusCode, message, errorObj) => {
    return res.status(statusCode).json({success: false, message, errors: errorObj});
}