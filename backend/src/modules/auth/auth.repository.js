import User from "../../models/user.model.js";

export const createUser = (data) => User.create(data);

export const findUserByEmail = (email) =>
    User.findOne({ email });