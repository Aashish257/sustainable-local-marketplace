import apiClient from "../../../services/apiClient";
import { REVIEWS } from "../../../services/endpoints";

export const getReviewsByProduct = async (productId) => {
    // Replace :productId in the URL string with the actual ID
    const response = await apiClient.get(REVIEWS.GET_BY_PRODUCT.replace(":productId", productId));
    return response.data;
};


export const getReviewByUser = async (userId) => {
    // Replace :userId in the URL string with the actual ID
    const response = await apiClient.get(REVIEWS.GET_BY_USER.replace(":userId", userId));
    return response.data;
};


export const addReview = async (reviewData) => {
    const response = await apiClient.post(REVIEWS.ADD, reviewData);
    return response.data;
};

export const editReview = async (reviewData) => {
    const response = await apiClient.put(REVIEWS.UPDATE, reviewData);
    return response.data;
};

export const deleteReview = async (reviewData) => {
    const response = await apiClient.delete(REVIEWS.DELETE, reviewData);
    return response.data;
};

export const getOneReview = async (reviewData) => {
    const response = await apiClient.get(REVIEWS.GET_ONE, reviewData);
    return response.data;
};

export const getAllReviews = async () => {
    const response = await apiClient.get(REVIEWS.GET_ALL);
    return response.data;
};
