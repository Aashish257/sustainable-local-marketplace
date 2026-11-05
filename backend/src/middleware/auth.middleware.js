import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";
import User from "../models/user.model.js";

// Verifies the JWT AND checks the account in the DB, so logout, suspension and
// role changes take effect immediately (a pure JWT check would trust the token for 7 days).
export const verifyAccessToken = async (token) => {
    if (!token) throw new AppError("Unauthorized", 401);
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        throw new AppError("Unauthorized", 401);
    }
    const user = await User.findById(decoded.id).select("name role isActive tokenVersion isDemo").lean();
    if (!user || user.isActive === false) throw new AppError("Unauthorized", 401);
    if ((decoded.tv ?? 0) !== (user.tokenVersion ?? 0)) throw new AppError("Session expired, please log in again", 401);
    return { id: user._id.toString(), role: user.role, name: user.name, isDemo: user.isDemo === true };
};

export const protect = async (req, res, next) => {
    try {
        req.user = await verifyAccessToken(req.headers.authorization?.split(" ")[1]);
        next();
    } catch (err) {
        next(err.status ? err : new AppError("Unauthorized", 401));
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
// Public demo accounts may look around but not change anything (flag comes from the DB, not the token)
const READ_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
export const blockDemoWrites = (req, res, next) => {
    if (req.user?.isDemo && !READ_METHODS.has(req.method)) {
        return next(new AppError("This action is disabled in the public demo.", 403));
    }
    next();
};
