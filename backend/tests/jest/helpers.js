import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";
import User from "../../src/models/user.model.js";
import { Product } from "../../src/models/product.model.js";

let mongod;

// Each test file gets its own throwaway in-memory MongoDB
export const startDb = async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
};
export const stopDb = async () => {
    await mongoose.disconnect();
    await mongod?.stop();
};
export const clearDb = async () => {
    for (const c of Object.values(mongoose.connection.collections)) await c.deleteMany({});
};

let n = 0;
export const makeUser = async (role = "buyer") => {
    const user = await User.create({ name: `Test ${role}`, email: `${role}${++n}@test.com`, password: "x", role });
    const token = jwt.sign({ id: user._id.toString(), role, name: user.name }, process.env.JWT_SECRET);
    return { user, token, auth: { Authorization: `Bearer ${token}` } };
};

export const makeProduct = (sellerId, extra = {}) =>
    Product.create({
        title: "Test Item", description: "a test product item", price: 100, sellerId,
        category: "test", stock: 5, sustainabilityScore: 5, isApproved: true, ...extra,
    });
