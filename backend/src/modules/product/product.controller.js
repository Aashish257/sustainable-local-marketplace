import {
    createProductService,
    getProductsService,
    getProductByIdService,
    updateProductService,
    deleteProductService,
} from "./product.service.js";
import { createProductSchema } from "./product.validation.js";

export const createProduct = async (req, res, next) => {
    try {
        const data = createProductSchema.parse(req.body);

        const product = await createProductService(data, req.user);

        res.status(201).json({ success: true, data: product });
    } catch (err) {
        next(err);
    }
};

export const getProducts = async (req, res, next) => {
    try {
        const products = await getProductsService(req.query);

        res.json({ success: true, data: products });
    } catch (err) {
        next(err);
    }
};

export const getProductById = async (req, res, next) => {
    try {
        const product = await getProductByIdService(req.params.id);
        res.json({ success: true, data: product });
    } catch (err) {
        next(err);
    }
};

export const updateProduct = async (req, res, next) => {
    try {
        const product = await updateProductService(
            req.params.id,
            req.body,
            req.user
        );

        res.json({ success: true, data: product });
    } catch (err) {
        next(err);
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        await deleteProductService(req.params.id, req.user);

        res.json({ success: true });
    } catch (err) {
        next(err);
    }
};