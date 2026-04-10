export const errorHandler = (err, req, res, next) => {
    // Handling status codes for more accurate API responses (e.g. 401, 403)
    const statusCode = err.status || (err.name === "ValidationError" || err.name === "ZodError" ? 400 : 500);
    
    res.status(statusCode).json({
        success: false,
        error: err.message || "Server Error",
    });
};