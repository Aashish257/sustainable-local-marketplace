import { Order } from "../../models/order.model.js";

export const createOrder = async (data) => {
    return await Order.create(data);
};

export const findOrderById = async (id) => {
    return await Order.findById(id);
};

export const findOrderByRazorpayId = async (razorpayOrderId) => {
    return await Order.findOne({ razorpayOrderId });
};

export const updateOrder = async (id, data) => {
    return await Order.findByIdAndUpdate(id, data, { new: true });
};
