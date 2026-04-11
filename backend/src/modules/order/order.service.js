import { getCartByUser, createOrUpdateCart } from "../cart/cart.repository.js";
import { findProductById } from "../product/product.repository.js";
import { createOrder } from "./order.repository.js";

export const createOrderService = async (userId) => {
    const cart = await getCartByUser(userId);

    if (!cart || cart.items.length === 0) {
        throw new Error("Cart is empty");
    }

    let total = 0;

    const items = [];

    for (const item of cart.items) {
        const product = await findProductById(item.productId);

        if (!product) throw new Error("Product not found");

        if (product.stock < item.quantity) {
            throw new Error("Insufficient stock");
        }

        total += product.price * item.quantity;

        items.push({
            productId: product._id,
            quantity: item.quantity,
            price: product.price,
        });
    }

    const order = await createOrder({
        buyerId: userId,
        items,
        totalAmount: total,
    });

    // Clear the cart
    await createOrUpdateCart(userId, []);

    return order;
};