import bcrypt from "bcrypt";

// 12 rounds in prod; set BCRYPT_ROUNDS=4 in tests for speed
const ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 12;

export const hashPassword = async (password) => {
    return await bcrypt.hash(password, ROUNDS);
};

export const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};