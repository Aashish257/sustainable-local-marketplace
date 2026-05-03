import apiClient from "../../../services/apiClient";
import { BIDS } from "../../../services/endpoints";

export const getHighestBid = async (productId) => {
    const url = BIDS.GET_HIGHEST.replace(":productId", productId);
    const response = await apiClient.get(url);
    return response.data;
};
