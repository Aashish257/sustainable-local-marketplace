import { registerService, loginService } from "./auth.service.js";
import User from "../../models/user.model.js";
import { registerSchema } from "./auth.validation.js";

export const register = async (req, res, next) => {
    try {
        const data = registerSchema.parse(req.body);
        const result = await registerService(data);

        res.status(201).json({
            success: true,
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

export const login = async (req, res, next) => {
    try {
        const result = await loginService(req.body);

        res.json({
            success: true,
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

// Bumping tokenVersion revokes every token this user holds (all devices)
export const logout = async (req, res, next) => {
    try {
        await User.updateOne({ _id: req.user.id }, { $inc: { tokenVersion: 1 } });
        res.json({ success: true, message: "Logged out successfully" });
    } catch (err) {
        next(err);
    }
};

export const getMe = async (req, res) => {
    res.json({ success: true, data: req.user });
};