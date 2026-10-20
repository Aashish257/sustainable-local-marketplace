import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["buyer", "seller"]).optional(), // Added to support role-based registration
    consent: z.literal(true, { errorMap: () => ({ message: "You must accept the privacy policy to register" }) }),
});