import apiClient from "../../../services/apiClient";
import { ORDERS } from "../../../services/endpoints";

export const createOrder = async (orderData) => {
    const payload = Array.isArray(orderData) ? { items: orderData } : orderData;
    const response = await apiClient.post(ORDERS.CREATE, payload);
    return response.data;
};

export const getOrderById = async (orderId) => {
    const response = await apiClient.get(ORDERS.GET_ONE.replace(":id", orderId));
    return response.data;
};
