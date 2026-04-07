import { registerService, loginService } from "./auth.service.js";
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