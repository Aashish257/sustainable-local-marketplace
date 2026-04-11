import { getCartByUser, createOrUpdateCart } from "./cart.repository.js";

export const addToCartService = async (userId, item) => {
    let cart = await getCartByUser(userId);

    if (!cart) {
        return await createOrUpdateCart(userId, [item]);
    }

    const existing = cart.items.find(
        (i) => i.productId._id.toString() === item.productId
    );

    if (existing) {
        existing.quantity += item.quantity;
    } else {
        cart.items.push(item);
    }

    await cart.save();

    return cart;
};

export const getCartService = async (userId) => {
    const cart = await getCartByUser(userId);
    if (!cart) return { items: [], total: 0 };

    const total = cart.items.reduce(
        (sum, item) => sum + item.productId.price * item.quantity,
        0
    );

    return { items: cart.items, total };
};

export const removeFromCartService = async (userId, productId) => {
    const cart = await getCartByUser(userId);
    if (!cart) return null;

    cart.items = cart.items.filter(
        (i) => i.productId._id.toString() !== productId
    );

    return await cart.save();
};