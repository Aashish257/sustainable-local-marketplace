import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) throw new Error("Unauthorized");

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();
    } catch (err) {
        next(new Error("Unauthorized"));
    }
};