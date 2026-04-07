export const errorHandler = (err, req, res, next) => {
    res.status(400).json({
        success: false,
        error: err.message || "Server Error",
    });
};