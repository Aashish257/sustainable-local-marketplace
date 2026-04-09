import { z } from "zod";

export const createProductSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters long"),
    price: z.number().positive("Price must be greater than 0"),
    category: z.string().optional(),
    stock: z.number().int().nonnegative("Stock cannot be negative").optional(),
    images: z.array(z.string()).optional(),
    sustainabilityScore: z.number().min(0).max(10).optional()
});

export const updateProductSchema = z.object({
    title: z.string().min(3).optional(),
    price: z.number().positive().optional(),
    category: z.string().optional(),
    stock: z.number().int().nonnegative().optional(),
    images: z.array(z.string()).optional(),
    sustainabilityScore: z.number().min(0).max(10).optional()
});
