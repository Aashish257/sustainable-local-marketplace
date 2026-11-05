import { z } from "zod";

export const addToCartSchema = z.object({
    productId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID"),
    quantity: z.number().int("Quantity must be a whole number").min(1, "Quantity must be at least 1").max(100, "Quantity can be at most 100").optional(),
});
