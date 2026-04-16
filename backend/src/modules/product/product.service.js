import {
    createProduct,
    findProducts,
    findProductById,
    updateProduct,
    deleteProduct,
} from "./product.repository.js";
import { AppError } from "../../utils/AppError.js";

export const createProductService = async (data, user) => {
    if (user.role !== "seller") {
        throw new AppError("Only sellers can create products", 403);
    }

    return await createProduct({
        ...data,
        sellerId: user.id,
    });
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

    return await updateProduct(id, data);
};

export const deleteProductService = async (id, user) => {
    const product = await findProductById(id);

    if (!product) throw new AppError("Product not found", 404);

    if (product.sellerId.toString() !== user.id) {
        throw new AppError("Unauthorized", 403);
    }

    await deleteProduct(id);
};

export const getProductByIdService = async (id) => {
    const product = await findProductById(id);
    if (!product) throw new AppError("Product not found", 404);
    return product;
};