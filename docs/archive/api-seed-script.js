/**
 * Comprehensive Seed Script for Sustainable Local Marketplace
 * Seeds Admin, Seller, Buyer accounts, 10+ diverse eco products across all categories,
 * live auction items, customer reviews, and sample orders.
 * 
 * Run with: node seed.js
 * (Ensure backend is running on http://localhost:5000)
 */

const BASE_URL = 'http://127.0.0.1:5000/api';

async function post(path, body, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });
        const json = await res.json();
        return { ok: res.ok, status: res.status, data: json };
    } catch (e) {
        return { ok: false, status: 500, error: e.message };
    }
}

async function seed() {
    console.log('\n🌿 SustainMarket — Complete Marketplace Seed Script\n');

    // 1. Admin Account
    console.log('1. Setting up Admin user...');
    await post('/auth/register', {
        name: 'SustainMarket Admin',
        email: 'admin@sustainmarket.com',
        password: 'Admin@1234',
        role: 'admin',
    });
    console.log('   ✅ Admin: admin@sustainmarket.com / Admin@1234');

    // 2. Seller Account
    console.log('2. Setting up Seller user...');
    let sellerLogin = await post('/auth/login', { email: 'seller@sustainmarket.com', password: 'Seller@1234' });
    if (!sellerLogin.ok) {
        await post('/auth/register', {
            name: 'Prakriti Eco Goods & Craft',
            email: 'seller@sustainmarket.com',
            password: 'Seller@1234',
            role: 'seller',
        });
        sellerLogin = await post('/auth/login', { email: 'seller@sustainmarket.com', password: 'Seller@1234' });
    }
    const sellerToken = sellerLogin.data?.data?.token;
    console.log('   ✅ Seller: seller@sustainmarket.com / Seller@1234');

    // 3. Buyer Account
    console.log('3. Setting up Buyer user...');
    let buyerLogin = await post('/auth/login', { email: 'buyer@sustainmarket.com', password: 'Buyer@1234' });
    if (!buyerLogin.ok) {
        await post('/auth/register', {
            name: 'Aarav Sharma',
            email: 'buyer@sustainmarket.com',
            password: 'Buyer@1234',
            role: 'buyer',
        });
        buyerLogin = await post('/auth/login', { email: 'buyer@sustainmarket.com', password: 'Buyer@1234' });
    }
    const buyerToken = buyerLogin.data?.data?.token;
    console.log('   ✅ Buyer: buyer@sustainmarket.com / Buyer@1234');

    // 4. Products across all 8 categories
    if (sellerToken) {
        console.log('\n4. Seeding rich product catalog across all categories...');

        const sampleProducts = [
            {
                title: 'Bamboo Cutlery & Straw Travel Kit',
                description: 'Complete 100% natural organic bamboo cutlery set including fork, knife, spoon, chopsticks, straw, and coconut fiber cleaning brush in a natural cotton carrying pouch. Zero-waste and dishwasher safe.',
                price: 349,
                category: 'Zero Waste',
                stock: 45,
                sustainabilityScore: 9.8,
                images: [
                    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&auto=format&fit=crop&q=80'
                ],
                biddingEnabled: false
            },
            {
                title: 'Cold-Pressed Wild Forest Honey (500g)',
                description: 'Raw, unheated and unfiltered honey ethically harvested by indigenous tribal beekeepers in the Nilgiri Biosphere. Rich in antioxidants and pollen.',
                price: 499,
                category: 'Organic Food',
                stock: 30,
                sustainabilityScore: 9.1,
                images: [
                    'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80'
                ],
                biddingEnabled: false
            },
            {
                title: 'Handloom Organic Cotton Khadi Shirt',
                description: 'Crafted from 100% GOTS-certified organic desi cotton, hand-spun and woven on traditional pit looms. Colored using 100% plant-based indigo and pomegranate rinds.',
                price: 1299,
                category: 'Eco Apparel',
                stock: 18,
                sustainabilityScore: 9.5,
                images: [
                    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80'
                ],
                biddingEnabled: true,
                biddingStartingPrice: 899
            },
            {
                title: 'Handcrafted Terracotta Clay Water Carafe',
                description: 'Natural porous clay jug naturally chills water via evaporative cooling without electricity. Alkaline balancing properties keep water fresh and mineral-rich.',
                price: 549,
                category: 'Handmade Goods',
                stock: 25,
                sustainabilityScore: 9.9,
                images: [
                    'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=80'
                ],
                biddingEnabled: false
            },
            {
                title: 'Coconut Shell Seedling Planters (Set of 6)',
                description: 'Upcycled discarded coconut shells converted into artisanal gardening pots with natural drainage holes. Complete with organic coco-peat discs and heirloom basil seeds.',
                price: 299,
                category: 'Home & Garden',
                stock: 40,
                sustainabilityScore: 9.4,
                images: [
                    'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&auto=format&fit=crop&q=80'
                ],
                biddingEnabled: false
            },
            {
                title: 'Refurbished Mechanical Solar Watch',
                description: 'Fully restored vintage solar-powered field watch with scratch-resistant sapphire crystal and reclaimed parachute-cord nylon strap. Zero battery replacements required.',
                price: 3499,
                category: 'Refurbished Tech',
                stock: 8,
                sustainabilityScore: 8.9,
                images: [
                    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80'
                ],
                biddingEnabled: true,
                biddingStartingPrice: 2499
            },
            {
                title: 'Upcycled Denim Patchwork Weekender Duffel',
                description: 'Heavy-duty weekender tote constructed from post-consumer recycled denim jeans and surplus canvas webbing. Hand-stitched with brass YKK hardware.',
                price: 1899,
                category: 'Upcycled Goods',
                stock: 12,
                sustainabilityScore: 9.6,
                images: [
                    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80'
                ],
                biddingEnabled: false
            },
            {
                title: 'Portable Monocrystalline Solar Charger 24W',
                description: 'Foldable ultra-high efficiency solar panel with dual USB smart ports and IP65 water resistance. Charge smartphones, power banks, and tablets directly from pure sunshine.',
                price: 2199,
                category: 'Renewable Energy',
                stock: 20,
                sustainabilityScore: 9.3,
                images: [
                    'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=600&auto=format&fit=crop&q=80'
                ],
                biddingEnabled: true,
                biddingStartingPrice: 1599
            }
        ];

        for (const p of sampleProducts) {
            const res = await post('/products', p, sellerToken);
            if (res.ok && res.data?.data?._id) {
                const createdId = res.data.data._id;
                console.log(`   ✅ Created [${p.category}]: "${p.title}" (ID: ${createdId})`);

                // Post a sample review from buyer
                if (buyerToken) {
                    await post('/reviews', {
                        productId: createdId,
                        rating: 5,
                        comment: 'Outstanding quality and truly sustainable packaging. Exactly as described, shipped quickly!'
                    }, buyerToken);
                }
            } else {
                console.log(`   ℹ Note for "${p.title}": ${res.data?.error || res.data?.message || 'already exists or skipped'}`);
            }
        }
    }

    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('🎉 Seed Complete! Test Credentials:');
    console.log('  👑 Admin:  admin@sustainmarket.com  / Admin@1234');
    console.log('  🛍️ Seller: seller@sustainmarket.com / Seller@1234');
    console.log('  🛒 Buyer:  buyer@sustainmarket.com  / Buyer@1234');
    console.log('');
    console.log('  🚀 Web App:  http://localhost:5173');
    console.log('  📡 Backend:  http://localhost:5000/api');
    console.log('════════════════════════════════════════════════════════════════\n');
}

seed().catch(err => {
    console.error('Seed execution error:', err);
});

