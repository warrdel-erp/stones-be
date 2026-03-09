import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minutes
    limit: 500, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, _res, next, options) => {
        _res.status(options.statusCode).json({
            success: false,
            message: options.message,
            errors: null,
        });
    },
});
