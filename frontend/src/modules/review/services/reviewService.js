import apiClient from "../../../services/apiClient";
import { REVIEWS } from "../../../services/endpoints";

export const getReviewsByProduct = async (productId) => {
    const response = await apiClient.get(REVIEWS.GET_BY_PRODUCT.replace(":productId", productId));
    return response.data;
};

export const createReview = async (reviewData) => {
    const response = await apiClient.post(REVIEWS.ADD, reviewData);
    return response.data;
};
