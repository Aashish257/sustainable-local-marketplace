import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { Product } from "../models/product.model.js";
import User from "../models/user.model.js";

// Load environment variables based on the path
dotenv.config({ path: "../../.env" });

const seedProducts = [
    {
        title: "Bamboo Toothbrush Set (4 Pack)",
        description: "100% biodegradable bamboo toothbrushes with charcoal-infused bristles. Plastic-free packaging. A simple swap to reduce daily plastic waste.",
        price: 350,
        category: "Zero Waste",
        stock: 150,
        images: ["https://images.unsplash.com/photo-1605600659928-2c264a13d0a2?q=80&w=800&auto=format&fit=crop"],
        sustainabilityScore: 9.5,
        biddingEnabled: false,
    },
    {
        title: "Upcycled Denim Tote Bag",
        description: "Handcrafted tote bag made from reclaimed denim jeans. Each bag is unique and features strong stitching for heavy groceries. Locally made.",
        price: 850,
        category: "Upcycled Goods",
        stock: 45,
        images: ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop"],
        sustainabilityScore: 8.8,
        biddingEnabled: false,
    },
    {
        title: "Organic Cotton T-Shirt",
        description: "GOTS-certified organic cotton t-shirt. Dyed using plant-based natural dyes. Super soft and breathable. Ethically manufactured.",
        price: 1200,
        category: "Organic Apparel",
        stock: 80,
        images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop"],
        sustainabilityScore: 9.2,
        biddingEnabled: false,
    },
    {
        title: "Portable Solar Charger 10000mAh",
        description: "Waterproof, dustproof solar power bank. Charge your phone using the power of the sun while hiking or camping. Includes carabiner.",
        price: 2499,
        category: "Renewable Energy",
        stock: 30,
        images: ["https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=800&auto=format&fit=crop"],
        sustainabilityScore: 8.5,
        biddingEnabled: false,
    },
    {
        title: "Reusable Beeswax Food Wraps",
        description: "Set of 3 assorted sizes. Natural alternative to plastic cling wrap. Made with organic cotton, sustainably harvested beeswax, jojoba oil, and tree resin.",
        price: 650,
        category: "Zero Waste",
        stock: 120,
        images: ["https://images.unsplash.com/photo-1610444391217-063fb8260f78?q=80&w=800&auto=format&fit=crop"],
        sustainabilityScore: 9.8,
        biddingEnabled: false,
    },
    {
        title: "Vintage Restored Leather Jacket",
        description: "Beautifully restored vintage leather jacket from the 80s. Cleaned and conditioned using eco-friendly products. One of a kind item.",
        price: 4500,
        category: "Upcycled Goods",
        stock: 1,
        images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop"],
        sustainabilityScore: 8.2,
        biddingEnabled: true,
        basePrice: 4000,
    },
    {
        title: "Biodegradable Phone Case",
        description: "Compostable phone case made from wheat straw and plant-based biopolymers. Drop tested to 6 feet. Protects your phone and the planet.",
        price: 999,
        category: "Zero Waste",
        stock: 200,
        images: ["https://images.unsplash.com/photo-1603527264259-22a89305141e?q=80&w=800&auto=format&fit=crop"],
        sustainabilityScore: 9.0,
        biddingEnabled: false,
    },
    {
        title: "Hand-poured Soy Wax Candle",
        description: "Vegan soy wax candle with a crackling wooden wick. Scented with natural essential oils (Lavender & Sage). Burn time: 40 hours.",
        price: 550,
        category: "Organic Apparel", // Closest fit in current categories, though 'Home' would be better
        stock: 60,
        images: ["https://images.unsplash.com/photo-1602874801007-bd458cb6c975?q=80&w=800&auto=format&fit=crop"],
        sustainabilityScore: 8.7,
        biddingEnabled: false,
    }
];

const seedDatabase = async () => {
    try {
        console.log("🌱 Connecting to MongoDB...");
        // Ensure the URI is loaded
        const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sustainable_db";
        await mongoose.connect(uri);
        console.log("✅ Connected to database.");

        // Clean existing collections
        console.log("🧹 Clearing existing collections...");
        await Product.deleteMany({});
        await User.deleteMany({});
        
        console.log("👤 Creating seed users...");
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("password123", salt);

        const adminUser = await User.create({
            name: "Super Admin",
            email: "admin@sustain.com",
            password: hashedPassword,
            role: "admin"
        });

        const sellerUser = await User.create({
            name: "Demo Seller",
            email: "seller@sustain.com",
            password: hashedPassword,
            role: "seller"
        });

        console.log("📦 Inserting new products...");
        const productsWithSeller = seedProducts.map(p => ({
            ...p,
            sellerId: sellerUser._id
        }));

        await Product.insertMany(productsWithSeller);
        console.log(`✅ Successfully seeded ${productsWithSeller.length} products!`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedDatabase();
