import User from "../../models/user.model.js";

export const findUserById = async (id) => {
    return await User.findById(id).select("-password");
};

export const getAllUsers = async () => {
    return await User.find().select("-password");
};

