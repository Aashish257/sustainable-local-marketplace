import apiClient from "../../../services/apiClient";
import { MESSAGES } from "../../../services/endpoints";

export const getChatHistory = async (receiverId) => {
    const url = MESSAGES.GET_HISTORY.replace(":receiverId", receiverId);
    const response = await apiClient.get(url);
    return response.data;
};
