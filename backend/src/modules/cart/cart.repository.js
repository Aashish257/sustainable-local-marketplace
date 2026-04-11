import { Cart } from "../../models/cart.model.js";

export const getCartByUser = (userId) =>
    Cart.findOne({ userId }).populate("items.productId");

export const createOrUpdateCart = (userId, items) =>
    Cart.findOneAndUpdate(
        { userId },
        { items },
        { upsert: true, new: true }
    );