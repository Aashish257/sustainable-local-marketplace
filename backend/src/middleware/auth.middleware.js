import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";

export const protect = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) throw new Error("Unauthorized");

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();
    } catch (err) {
        // 401 so clients can tell "log in again" apart from a server error
        next(new AppError("Unauthorized", 401));
    }
};

// Sets req.user when a valid token is sent, but never blocks the request
export const optionalAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
        try {
            req.user = jwt.verify(token, process.env.JWT_SECRET);
        } catch {
            // invalid token: continue as a guest
        }
    }
    next();
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            const error = new Error("Forbidden: You do not have permission to perform this action");
            error.status = 403; // Correct status for Forbidden access
            return next(error);
        }
        next();
    };
};