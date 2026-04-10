import { Product } from "../../models/product.model.js";

/**
 * Repository layer for Product.
 * Handles all direct database interactions.
 * Note: Business logic is kept in the service layer as per Day 3 requirements.
 */

export const createProduct = async (data) => {
    return await Product.create(data);
};

export const findProducts = async (query, { skip = 0, limit = 10, sort = { createdAt: -1 } }) => {
    // Implementing pagination and sorting as per requirements 9 & 12
    return await Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit);
};

export const findProductById = async (id) => {
    return await Product.findById(id);
};

export const updateProduct = async (id, data) => {
    return await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

export const deleteProduct = async (id) => {
    return await Product.findByIdAndDelete(id);
};