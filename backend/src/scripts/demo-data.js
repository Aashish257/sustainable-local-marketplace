// Public demo data: the shared demo accounts and the demo seller's products.
// resetDemoData() puts them back to this state without touching real accounts.
import { hashPassword } from "../utils/hash.js";
import User from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { Review } from "../models/review.model.js";
import { Bid } from "../models/bid.model.js";
import { Message } from "../models/message.model.js";
import { Notification } from "../models/notification.model.js";
import { Cart } from "../models/cart.model.js";

export const DEMO_PASSWORD = "password123";

export const DEMO_USERS = {
    admin: { name: "Super Admin", email: "admin@sustain.com", role: "admin" },
    seller: { name: "Demo Seller", email: "seller@sustain.com", role: "seller" },
    buyer: { name: "Aria Green", email: "buyer@sustain.com", role: "buyer" },
};

export const DEMO_PRODUCTS = [
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
        biddingEndTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // demo auction runs for 7 days from seeding
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

// Deletes everything created by or for the demo accounts, then recreates them fresh.
// Real accounts (the owner admin, registered users) and their data are left alone.
export const resetDemoData = async () => {
    const demoEmails = Object.values(DEMO_USERS).map((u) => u.email);
    const demoIds = (await User.find({ $or: [{ isDemo: true }, { email: { $in: demoEmails } }] }, "_id")).map((u) => u._id);
    const productIds = (await Product.find({ sellerId: { $in: demoIds } }, "_id")).map((p) => p._id);

    await Promise.all([
        Review.deleteMany({ $or: [{ userId: { $in: demoIds } }, { productId: { $in: productIds } }] }),
        Order.deleteMany({ $or: [{ buyerId: { $in: demoIds } }, { "items.productId": { $in: productIds } }] }),
        Bid.deleteMany({ $or: [{ userId: { $in: demoIds } }, { productId: { $in: productIds } }] }),
        Message.deleteMany({ $or: [{ senderId: { $in: demoIds } }, { receiverId: { $in: demoIds } }] }),
        Notification.deleteMany({ userId: { $in: demoIds } }),
        Cart.deleteMany({ userId: { $in: demoIds } }),
        Cart.updateMany({}, { $pull: { items: { productId: { $in: productIds } } } }),
    ]);
    await Product.deleteMany({ _id: { $in: productIds } });
    await User.deleteMany({ _id: { $in: demoIds } });

    const password = await hashPassword(DEMO_PASSWORD);
    const users = {};
    for (const [key, u] of Object.entries(DEMO_USERS)) {
        users[key] = await User.create({ ...u, password, isDemo: true, consentGiven: true, consentAt: new Date() });
    }
    await Product.insertMany(DEMO_PRODUCTS.map((p) => ({ ...p, sellerId: users.seller._id, isApproved: true })));
    return users;
};
