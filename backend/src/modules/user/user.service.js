import { findUserById, getAllUsers } from "./user.repository.js";

export const getProfileService = async (userId) => {
    const user = await findUserById(userId);
    if (!user) {
        const err = new Error("User not found");
        err.statusCode = 404;
        throw err;
    }
    return user;
};

export const getUsersService = async () => {
    return await getAllUsers();
};