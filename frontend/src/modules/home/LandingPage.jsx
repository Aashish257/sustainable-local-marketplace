import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { useProducts } from '../product/services/productQueries';
import ProductCard from '../product/components/ProductCard';
import ThreeLeafScene from '../../shared/components/ThreeLeafScene';

const CATEGORIES = [
    { name: 'Zero Waste', desc: 'Closed-loop everyday essentials', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' },
    { name: 'Organic Food', desc: 'Direct farm harvests & pure honey', icon: 'M12 2a9 9 0 0 1 9 9c0 4.97-4.03 9-9 9A9 9 0 0 1 3 11C3 6.03 7.03 2 12 2z' },
    { name: 'Sustainable Fashion', desc: 'Ethical khadi & circular textiles', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
    { name: 'Eco Home', desc: 'Artisan pottery & bamboo decor', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Clean Beauty', desc: 'Pure botanicals & cold-pressed oils', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
    { name: 'Solar & Tech', desc: 'Renewable energy & low-power kits', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
];

const LandingPage = () => {
    const { isAuthenticated } = useAuthStore();
    const { data: productsData, isLoading } = useProducts({ limit: 8 });
    const products = productsData?.data || [];

    const spotlightProduct = products.find(p => p.biddingEnabled) || products[0];

    return (
        <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] transition-colors duration-300 relative overflow-hidden">

            {/* ===== HERO SECTION WITH 3D LEAF SCENE ===== */}
            <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-32 border-b border-[var(--border-card)]">
                
                {/* 3D WebGL Leaf Canvas Background */}
                <ThreeLeafScene />

                {/* Content Overlay */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                        {/* Left Column: Mission & Headline */}
                        <div className="lg:col-span-7 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium text-xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span>COMMUNITY-VERIFIED SUSTAINABLE MARKETPLACE</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-[var(--text-main)] leading-[1.08]">
                                Pure Local Goods, <br />
                                <span className="text-emerald-600 dark:text-emerald-400">Zero Middlemen.</span>
                            </h1>

                            <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-xl font-sans leading-relaxed">
                                Directly discover verified local organic farmers, zero-waste artisans, and circular workshops. Compare audited footprint ratings and trade with transparent community escrow.
                            </p>

                            {/* Dual CTAs */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <Link
                                    to="/marketplace"
                                    className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs uppercase font-bold tracking-wider"
                                >
                                    <span>Explore Marketplace</span>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </Link>

                                <Link
                                    to="/register"
                                    className="btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs uppercase font-bold tracking-wider"
                                >
                                    Become a Producer / Seller
                                </Link>
                            </div>

                            {/* Verified Impact Strip */}
                            <div className="pt-6 border-t border-[var(--border-card)] grid grid-cols-3 gap-4 font-mono">
                                <div>
                                    <p className="text-2xl font-bold text-[var(--text-main)]">100%</p>
                                    <p className="text-xs text-[var(--text-muted)] uppercase mt-0.5">Origin Proven</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">0.0g</p>
                                    <p className="text-xs text-[var(--text-muted)] uppercase mt-0.5">Single-use Plastic</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-amber-500">&lt;24H</p>
                                    <p className="text-xs text-[var(--text-muted)] uppercase mt-0.5">Artisan Dispatch</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Spotlight Feature Card */}
                        <div className="lg:col-span-5">
                            {spotlightProduct ? (
                                <div className="glass-card p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full uppercase">
                                            SPOTLIGHT DROP
                                        </span>
                                        {spotlightProduct.biddingEnabled && (
                                            <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                AUCTION ACTIVE
                                            </span>
                                        )}
                                    </div>

                                    {/* Thumbnail */}
                                    <div className="relative h-60 rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 border border-[var(--border-card)]">
                                        {spotlightProduct.images?.[0] && (
                                            <img
                                                src={spotlightProduct.images[0]}
                                                alt={spotlightProduct.title}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-base font-bold font-display text-[var(--text-main)] truncate">
                                            {spotlightProduct.title}
                                        </h3>
                                        <p className="text-xs text-[var(--text-muted)] font-sans line-clamp-2 mt-1">
                                            {spotlightProduct.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-[var(--border-card)]">
                                        <div>
                                            <span className="text-xs text-[var(--text-muted)] font-mono block">PRICE</span>
                                            <span className="text-lg font-bold font-mono text-[var(--text-main)]">
                                                ₹{spotlightProduct.price?.toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                        <Link
                                            to={`/products/${spotlightProduct._id}`}
                                            className="btn-primary px-4 py-2 text-xs uppercase font-bold"
                                        >
                                            {spotlightProduct.biddingEnabled ? 'Join Bid →' : 'View Product →'}
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="glass-card p-12 text-center text-xs text-[var(--text-muted)]">
                                    Loading curated drops...
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </section>

            {/* ===== CATEGORIES BENTO GRID ===== */}
            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="space-y-2 mb-10">
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        CURATED TAXONOMY
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-[var(--text-main)]">
                        Explore by Sustainable Category
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {CATEGORIES.map((cat, i) => (
                        <Link
                            key={i}
                            to={`/marketplace?category=${encodeURIComponent(cat.name)}`}
                            className="glass-card hover-card-trigger p-6 flex flex-col justify-between group block"
                        >
                            <div className="space-y-3">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold font-display text-[var(--text-main)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                    {cat.name}
                                </h3>
                                <p className="text-xs text-[var(--text-muted)] font-sans leading-relaxed">
                                    {cat.desc}
                                </p>
                            </div>
                            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-4 flex items-center gap-1">
                                <span>Browse category</span>
                                <span>→</span>
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ===== FEATURED PRODUCTS GRID ===== */}
            <section className="py-20 border-t border-[var(--border-card)] bg-[var(--bg-surface-elevated)]/40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
                        <div>
                            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                FRESH ARRIVALS
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-[var(--text-main)] mt-1">
                                Verified Local Catalog
                            </h2>
                        </div>
                        <Link
                            to="/marketplace"
                            className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline uppercase"
                        >
                            View Entire Marketplace →
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(n => (
                                <div key={n} className="glass-card h-80 animate-pulse" />
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="glass-card p-12 text-center text-xs text-[var(--text-muted)]">
                            No products currently published.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {products.slice(0, 8).map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ===== HOW IT WORKS 3-STEP JOURNEY ===== */}
            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[var(--border-card)]">
                <div className="text-center space-y-2 mb-12">
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        OUR SYSTEM
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-[var(--text-main)]">
                        How SustainMarket Functions
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="glass-card p-6 space-y-3 text-center">
                        <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">01</span>
                        <h3 className="text-base font-bold font-display text-[var(--text-main)]">Verified Provenance</h3>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed font-sans">
                            Every producer is audited for true organic cultivation, non-toxic processing, and zero-plastic packaging.
                        </p>
                    </div>

                    <div className="glass-card p-6 space-y-3 text-center">
                        <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">02</span>
                        <h3 className="text-base font-bold font-display text-[var(--text-main)]">Live Bids &amp; Direct Chat</h3>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed font-sans">
                            Bid on rare seasonal artisan batches in real-time or message growers directly to learn about their methods.
                        </p>
                    </div>

                    <div className="glass-card p-6 space-y-3 text-center">
                        <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">03</span>
                        <h3 className="text-base font-bold font-display text-[var(--text-main)]">Secure checkout</h3>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed font-sans">
                            Pay securely via Razorpay with atomic stock reservation. Sellers are notified instantly to ship your order.
                        </p>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default LandingPage;
