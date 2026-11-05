import apiClient from "../../../services/apiClient";
import { PAYMENTS } from "../../../services/endpoints";

export const createPayment = async (orderId) => {
    const response = await apiClient.post(PAYMENTS.CREATE, { orderId });
    return response.data;
};

export const verifyPayment = async (paymentData) => {
    const response = await apiClient.post(PAYMENTS.VERIFY, paymentData);
    return response.data;
};
