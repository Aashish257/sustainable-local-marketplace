import apiClient from "../../../services/apiClient";
import { ORDERS } from "../../../services/endpoints";

export const createOrder = async (cartItems) => {
    // We send the items to the backend. The backend will look up the prices!
    const response = await apiClient.post(ORDERS.CREATE, { items: cartItems });
    return response.data;
};
