import {
    createUser,
    findUserByEmail,
} from "./auth.repository.js";
import { hashPassword, comparePassword } from "../../utils/hash.js";
import { generateToken } from "../../utils/jwt.js";
import { AppError } from "../../utils/AppError.js";

export const registerService = async (data) => {
    const existing = await findUserByEmail(data.email);
    if (existing) throw new AppError("User already exists", 400);

    const hashed = await hashPassword(data.password);

    const user = await createUser({
        ...data,
        password: hashed,
    });

    return { id: user._id };
};

export const loginService = async ({ email, password }) => {
    const user = await findUserByEmail(email);
    if (!user) throw new AppError("Invalid credentials", 400);

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) throw new AppError("Invalid credentials", 400);

    const token = generateToken({
        id: user._id,
        role: user.role,
    });

    return { token };
};