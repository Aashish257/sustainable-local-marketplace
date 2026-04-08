import { getProfileService, getUsersService } from "./user.service.js";

export const getProfile = async (req, res, next) => {
    try {
        // use the stictly defined req.user from the protect middleware

        const user = await getProfileService(req.user.id);

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (err) {
        next(err);
    }
};

export const getUsers = async (req, res, next) => {
    try {
        const users = await getUsersService();

        res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    } catch (err) {
        next(err);
    }
};
