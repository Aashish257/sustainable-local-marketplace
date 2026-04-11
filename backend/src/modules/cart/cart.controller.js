import { addToCartService, getCartService, removeFromCartService } from "./cart.service.js";

export const addToCart = async (req, res, next) => {
    try {
        const cart = await addToCartService(req.user.id, req.body);

        res.json({ success: true, data: cart });
    } catch (err) {
        next(err);
    }
};

export const getCart = async (req, res, next) => {
    try {
        const cart = await getCartService(req.user.id);
        res.json({ success: true, data: cart });
    } catch (err) {
        next(err);
    }
};

export const removeFromCart = async (req, res, next) => {
    try {
        const cart = await removeFromCartService(req.user.id, req.params.id);
        res.json({ success: true, data: cart });
    } catch (err) {
        next(err);
    }
};
