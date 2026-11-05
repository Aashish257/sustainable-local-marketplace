import { z } from "zod";

export const createProductSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters long"),
    description: z.string().min(10, "Description must be at least 10 characters long"),
    price: z.number().positive("Price must be greater than 0"),
    category: z.string().optional(),
    stock: z.number().int().nonnegative("Stock cannot be negative").optional(),
    images: z.array(z.string()).optional(),
    sustainabilityScore: z.number().min(0).max(10).optional(),
    biddingEnabled: z.boolean().optional(),
    biddingStartingPrice: z.number().nonnegative().optional(),
    biddingEndTime: z.string().or(z.date()).optional()
}).refine(
    // An auction needs an end time in the future (max 30 days), or it would never close
    (d) => {
        if (!d.biddingEnabled) return true;
        const end = new Date(d.biddingEndTime).getTime();
        const now = Date.now();
        return Number.isFinite(end) && end > now && end <= now + 30 * 24 * 60 * 60 * 1000;
    },
    { message: "Auctions need an end time between now and 30 days from now", path: ["biddingEndTime"] }
);

export const updateProductSchema = z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    price: z.number().positive().optional(),
    category: z.string().optional(),
    stock: z.number().int().nonnegative().optional(),
    images: z.array(z.string()).optional(),
    sustainabilityScore: z.number().min(0).max(10).optional(),
    biddingEnabled: z.boolean().optional(),
    biddingStartingPrice: z.number().nonnegative().optional(),
    biddingEndTime: z.string().or(z.date()).optional()
});
