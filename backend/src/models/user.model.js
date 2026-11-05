import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },

        password: { type: String, required: true },

        role: {
            type: String,
            enum: ["buyer", "seller", "admin"],
            default: "buyer",
        },

        // Privacy consent captured at signup (DPDP / GDPR style audit trail)
        consentGiven: { type: Boolean, default: false },
        consentAt: { type: Date },

        // Suspended accounts cannot log in or use existing tokens
        isActive: { type: Boolean, default: true },
        // Shared public demo accounts: read-only in the admin area (see blockDemoWrites)
        isDemo: { type: Boolean, default: false },
        // Bumped on logout/suspension: every token issued before that stops working
        tokenVersion: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema);