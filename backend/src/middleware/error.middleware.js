export const errorHandler = (err, req, res, next) => {
    // Handling status codes for more accurate API responses (e.g. 401, 403)
    const statusCode = err.status || (err.name === "ValidationError" || err.name === "ZodError" ? 400 : 500);
    
    // Zod's err.message is a JSON dump of every issue; show the first readable one instead
    const message = err.name === "ZodError" && err.errors?.length ? err.errors[0].message : err.message;

    res.status(statusCode).json({
        success: false,
        error: message || "Server Error",
    });
};