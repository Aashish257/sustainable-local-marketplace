import apiClient from "../../../services/apiClient";
import { PRODUCTS } from "../../../services/endpoints";

export const getProducts = async (params = {}) => {
    // Axios takes a second argument for GET requests which is a config object.
    // The "params" property is used by Axios to automatically build query strings.
    const response = await apiClient.get(PRODUCTS.GET_ALL, { params });

    // In our AppError backend, successful responses often wrap data in a "data" property.
    // Return response.data so the components don't have to deal with Axios objects.
    return response.data;
};

export const getProductById = async (id) => {
    const response = await apiClient.get(PRODUCTS.GET_ONE.replace(":id", id));
    return response.data;
};

export const createProduct = async (productData) => {
    const response = await apiClient.post(PRODUCTS.ADD, productData);
    return response.data;
};

export const updateProduct = async (id, productData) => {
    const response = await apiClient.put(PRODUCTS.UPDATE.replace(":id", id), productData);
    return response.data;
};

export const deleteProduct = async (id) => {
    const response = await apiClient.delete(PRODUCTS.DELETE.replace(":id", id));
    return response.data;
};

export const getCategories = async () => {
    const response = await apiClient.get(PRODUCTS.CATEGORIES);
    return response.data;
};
