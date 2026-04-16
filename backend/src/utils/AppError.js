/**
 * Standard Application Error Class
 * Extends the native Error class to include HTTP status codes.
 */
export class AppError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status; // Picking up by error.middleware.js
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
