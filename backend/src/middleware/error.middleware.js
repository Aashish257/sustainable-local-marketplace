export const errorHandler = (err, req, res, next) => {

    const statusCode = err.statusCode || 400;

    res.status(statusCode).json({
        success: false,
        error: err.message || "Server Error",
    });
};