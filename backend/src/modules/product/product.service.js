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
    const {
        page = 1,
        limit = 12,
        category,
        minPrice,
        maxPrice,
        minEcoScore,
        sort,
        search,
        type,     // "fixed" = buy-now items, "auction" = auction items
        auction,  // with type=auction: "live" or "ended"
    } = query;

    // Public catalog shows only approved, active listings
    const filter = { isApproved: true, isActive: true };

    if (search && search.trim()) {
        filter.$or = [
            { title: { $regex: search.trim(), $options: "i" } },
            { description: { $regex: search.trim(), $options: "i" } },
            { category: { $regex: search.trim(), $options: "i" } }
        ];
    }

    if (category && category.trim()) {
        // Match both 'Zero Waste', 'zero-waste', 'zero waste'
        const normalized = category.trim().replace(/[-_]/g, ".*");
        filter.category = { $regex: new RegExp(`^${normalized}$`, "i") };
    }

    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice && !isNaN(minPrice)) filter.price.$gte = Number(minPrice);
        if (maxPrice && !isNaN(maxPrice)) filter.price.$lte = Number(maxPrice);
    }

    if (minEcoScore && !isNaN(minEcoScore)) {
        filter.sustainabilityScore = { $gte: Number(minEcoScore) };
    }

    // Marketplace (fixed price) and Auctions are separate sections of the site
    if (type === "fixed") filter.biddingEnabled = { $ne: true };
    if (type === "auction") filter.biddingEnabled = true;
    if (type === "auction" && auction === "live") {
        filter.auctionClosed = { $ne: true };
        // $and keeps this separate from the search $or above
        filter.$and = [{ $or: [{ biddingEndTime: null }, { biddingEndTime: { $gt: new Date() } }] }];
    }
    if (type === "auction" && auction === "ended") {
        filter.$and = [{ $or: [{ auctionClosed: true }, { biddingEndTime: { $lte: new Date() } }] }];
    }

    let sortObj = { createdAt: -1 };
    if (sort === "price_asc") sortObj = { price: 1 };
    else if (sort === "price_desc") sortObj = { price: -1 };
    else if (sort === "rating") sortObj = { averageRating: -1 };
    else if (sort === "eco") sortObj = { sustainabilityScore: -1 };
    else if (sort === "newest") sortObj = { createdAt: -1 };
    else if (sort === "ending") sortObj = { biddingEndTime: 1, createdAt: -1 }; // soonest first

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 12);

    const result = await findProducts(filter, {
        skip: (pageNum - 1) * limitNum,
        limit: limitNum,
        sort: sortObj
    });

    return {
        products: result.products,
        pagination: {
            total: result.total,
            totalPages: result.totalPages,
            page: pageNum,
            limit: limitNum
        }
    };
};

export const updateProductService = async (id, data, user) => {
    const product = await findProductById(id);

    if (!product) throw new AppError("Product not found", 404);

    const sellerId = product.sellerId._id ? product.sellerId._id.toString() : product.sellerId.toString();
    if (sellerId !== user.id) {
        throw new AppError("Unauthorized", 403);
    }

    // The edit form re-sends every field, so only count values that actually differ
    const same = (a, b) =>
        a instanceof Date || b instanceof Date
            ? new Date(a).getTime() === new Date(b).getTime()
            : JSON.stringify(a) === JSON.stringify(b);
    const changed = (f) => data[f] !== undefined && !same(data[f], product[f]);

    // Auction settings are locked once bidding has started
    const biddingFields = ["biddingEnabled", "biddingStartingPrice", "biddingEndTime"];
    if ((product.currentBid != null || product.auctionClosed) && biddingFields.some(changed)) {
        throw new AppError("Auction settings cannot change after bidding has started", 409);
    }

    // Changing what buyers see (text, photos, eco score) sends the listing back to moderation.
    // Price and stock changes don't.
    const contentFields = ["title", "description", "images", "category", "sustainabilityScore"];
    if (contentFields.some(changed)) data = { ...data, isApproved: false };

    const updated = await updateProduct(id, data);

    // Invalidate product listing cache (Requirement 1)
    await invalidateCache("cache:/api/products*");

    return updated;
};

export const deleteProductService = async (id, user) => {
    const product = await findProductById(id);

    if (!product) throw new AppError("Product not found", 404);

    const sellerId = product.sellerId._id ? product.sellerId._id.toString() : product.sellerId.toString();
    if (sellerId !== user.id) {
        throw new AppError("Unauthorized", 403);
    }

    await deleteProduct(id);

    // Invalidate product listing cache (Requirement 1)
    await invalidateCache("cache:/api/products*");
};

export const getProductByIdService = async (id, user) => {
    const product = await findProductById(id);
    if (!product) throw new AppError("Product not found", 404);

    // Pending/inactive listings are visible only to their seller and admins
    if (!product.isApproved || !product.isActive) {
        const ownerId = (product.sellerId?._id || product.sellerId)?.toString();
        const canSee = user && (user.role === "admin" || user.id === ownerId);
        if (!canSee) throw new AppError("Product not found", 404);
    }
    return product;
};
