import {
    createProduct,
    findProducts,
    findProductById,
    updateProduct,
    deleteProduct,
} from "./product.repository.js";
import { AppError } from "../../utils/AppError.js";
import { invalidateCache } from "../../middleware/cache.middleware.js";

export const createProductService = async (data, user) => {
    if (user.role !== "seller") {
        throw new AppError("Only sellers can create products", 403);
    }

    const product = await createProduct({
        ...data,
        sellerId: user.id,
    });

    // Invalidate product listing cache (Requirement 1)
    await invalidateCache("cache:/api/products*");

    return product;
};


export const getProductsService = async (query) => {
    const { page = 1, limit = 10, category, minPrice, maxPrice } = query;

    const filter = {};

    if (category) filter.category = category;
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    return await findProducts(filter, {
        skip: (page - 1) * limit,
        limit: Number(limit),
    });
};

export const updateProductService = async (id, data, user) => {
    const product = await findProductById(id);

    if (!product) throw new AppError("Product not found", 404);

    if (product.sellerId.toString() !== user.id) {
        throw new AppError("Unauthorized", 403);
    }

    const updated = await updateProduct(id, data);

    // Invalidate product listing cache (Requirement 1)
    await invalidateCache("cache:/api/products*");

    return updated;
};

export const deleteProductService = async (id, user) => {
    const product = await findProductById(id);

    if (!product) throw new AppError("Product not found", 404);

    if (product.sellerId.toString() !== user.id) {
        throw new AppError("Unauthorized", 403);
    }

    await deleteProduct(id);

    // Invalidate product listing cache (Requirement 1)
    await invalidateCache("cache:/api/products*");
};

export const getProductByIdService = async (id) => {
    const product = await findProductById(id);
    if (!product) throw new AppError("Product not found", 404);
    return product;
};