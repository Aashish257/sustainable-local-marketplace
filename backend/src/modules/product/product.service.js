import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} from "./product.repository.js";

export const createProductService = async (data, user) => {
    if (user.role !== "seller") {
        throw new Error("Only sellers can create products");
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

    return await getProducts(filter, {
        skip: (page - 1) * limit,
        limit: Number(limit),
    });
};

export const updateProductService = async (id, data, user) => {
    const product = await getProductById(id);

    if (!product) throw new Error("Product not found");

    if (product.sellerId.toString() !== user.id) {
        throw new Error("Unauthorized");
    }

    return await updateProduct(id, data);
};

export const deleteProductService = async (id, user) => {
    const product = await getProductById(id);

    if (!product) throw new Error("Product not found");

    if (product.sellerId.toString() !== user.id) {
        throw new Error("Unauthorized");
    }

    await deleteProduct(id);
};