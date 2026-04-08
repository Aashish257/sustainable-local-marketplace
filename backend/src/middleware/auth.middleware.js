import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            const err = new Error("Not authorized, no token");
            err.statusCode = 401;
            throw err;
        }
        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Critical: set req.user to strictly contain id and role only
        req.user = {
            id: decoded.id,
            role: decoded.role,
        };

        next();
    } catch (error) {
        const err = new Error("Not authorized, invalid token");
        err.statusCode = 401;
        next(err);
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            const err = new Error("Forbidden");
            err.statusCode = 403;
            return next(err);
        }
        next();
    };
};