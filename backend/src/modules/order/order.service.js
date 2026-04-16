import { getCartByUser, createOrUpdateCart } from "../cart/cart.repository.js";
import { findProductById } from "../product/product.repository.js";
import { createOrder } from "./order.repository.js";
import { AppError } from "../../utils/AppError.js";

export const createOrderService = async (userId) => {
    const cart = await getCartByUser(userId);

    if (!cart || cart.items.length === 0) {
        throw new AppError("Cart is empty", 400);
    }

    let total = 0;

    const items = [];

    for (const item of cart.items) {
        const product = await findProductById(item.productId);

        if (!product) throw new AppError("Product not found", 404);

        if (product.stock < item.quantity) {
            throw new AppError("Insufficient stock", 400);
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