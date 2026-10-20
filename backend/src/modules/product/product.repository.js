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
    const [products, total] = await Promise.all([
        Product.find(query)
            .populate("sellerId", "name email")
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
        Product.countDocuments(query)
    ]);

    return {
        products,
        total,
        totalPages: Math.ceil(total / limit) || 1
    };
};

export const findProductById = async (id) => {
    return await Product.findById(id).populate("sellerId", "name email");
};

export const updateProduct = async (id, data) => {
    return await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

export const deleteProduct = async (id) => {
    return await Product.findByIdAndDelete(id);
};

// Atomic: decrements only if enough stock remains. Returns null when sold out.
export const decrementStockIfAvailable = async (id, qty) => {
    return await Product.findOneAndUpdate(
        { _id: id, stock: { $gte: qty } },
        { $inc: { stock: -qty } },
        { new: true }
    );
};
