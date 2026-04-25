import mongoose from 'mongoose';
import { Product } from './src/models/product.model.js';
import User from './src/models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB!");

        // 1. Create a dummy seller
        const seller = await User.create({
            name: "Eco Store",
            email: "eco@store.com",
            password: "password123", // Assuming no pre-save hook breaks this
            role: "seller"
        });

        // 2. Create some dummy products
        await Product.create([
            {
                title: "Bamboo Toothbrush",
                price: 5.99,
                sellerId: seller._id,
                category: "home",
                stock: 100,
                sustainabilityScore: 9,
                description: "A 100% biodegradable bamboo toothbrush. Say no to plastic!",
                images: ["https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=500&q=60"]
            },
            {
                title: "Organic Cotton T-Shirt",
                price: 25.00,
                sellerId: seller._id,
                category: "clothing",
                stock: 50,
                sustainabilityScore: 8,
                description: "Ethically sourced, 100% organic cotton plain white t-shirt.",
                images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=60"]
            },
            {
                title: "Solar Power Bank",
                price: 45.50,
                sellerId: seller._id,
                category: "electronics",
                stock: 0, // Out of stock to test your disabled button!
                sustainabilityScore: 7,
                description: "Charge your phone using the sun. Includes a massive 20,000mAh battery.",
                images: ["https://images.unsplash.com/photo-1620050860829-18ba4d852bd8?auto=format&fit=crop&w=500&q=60"]
            }
        ]);

        console.log("✅ Seeded 1 User and 3 Products successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding:", error);
        process.exit(1);
    }
};

seedDB();
