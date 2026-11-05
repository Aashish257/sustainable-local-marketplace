import apiClient from "../../services/apiClient";
import { AUTH } from "../../services/endpoints";

// Login User
export const loginUser = async (data) => {
    const response = await apiClient.post(AUTH.LOGIN, data);
    return response.data;
};

// Register User
export const registerUser = async (data) => {
    const response = await apiClient.post(AUTH.REGISTER, data);
    return response.data;
};

// Logout User
export const logoutUser = async () => {
    const response = await apiClient.post(AUTH.LOGOUT);
    return response.data;
};