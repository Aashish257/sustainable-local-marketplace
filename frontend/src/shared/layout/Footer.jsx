import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-[var(--bg-surface-elevated)] text-[var(--text-main)] border-t border-[var(--border-card)] transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    
                    {/* Brand & Sustainability Mission */}
                    <div className="md:col-span-1 space-y-4">
                        <Link to="/" className="flex items-center gap-2.5 group">
                            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2a9 9 0 0 1 9 9c0 4.97-4.03 9-9 9A9 9 0 0 1 3 11C3 6.03 7.03 2 12 2z" />
                                    <path d="M12 2v20" />
                                    <path d="M12 12c-3-2-5-1-6 2" />
                                    <path d="M12 8c3-2 5-1 6 2" />
                                </svg>
                            </div>
                            <div>
                                <span className="font-bold font-display text-base text-[var(--text-main)] tracking-tight">
                                    Sustain<span className="text-emerald-600 dark:text-emerald-400">Market</span>
                                </span>
                                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-mono tracking-widest uppercase">
                                    LOCAL CIRCULAR COMMERCE
                                </div>
                            </div>
                        </Link>

                        <p className="text-xs text-[var(--text-muted)] leading-relaxed font-sans">
                            Direct, transparent marketplace empowering local organic growers, zero-waste crafters, and circular artisans. Every purchase measurably prevents carbon emissions.
                        </p>

                        <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border-card)] font-mono text-xs text-[var(--text-muted)] space-y-1.5">
                            <div className="flex justify-between items-center">
                                <span>ORIGIN VERIFICATION</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% PROVEN</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>PACKAGING STANDARD</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">ZERO SINGLE-USE PLASTIC</span>
                            </div>
                        </div>
                    </div>

                    {/* Marketplace Links */}
                    <div>
                        <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[var(--text-main)] mb-4">
                            Marketplace
                        </h3>
                        <ul className="space-y-2.5 text-xs font-sans">
                            <li>
                                <Link to="/marketplace" className="text-[var(--text-muted)] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                                    All Sustainable Goods
                                </Link>
                            </li>
                            <li>
                                <Link to="/marketplace?category=Organic+Food" className="text-[var(--text-muted)] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                                    Organic Food &amp; Produce
                                </Link>
                            </li>
                            <li>
                                <Link to="/marketplace?category=Zero+Waste" className="text-[var(--text-muted)] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                                    Zero-Waste Essentials
                                </Link>
                            </li>
                            <li>
                                <Link to="/marketplace?category=Sustainable+Fashion" className="text-[var(--text-muted)] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                                    Handmade Eco Apparel
                                </Link>
                            </li>
                            <li>
                                <Link to="/marketplace?bidding=true" className="text-amber-500 hover:text-amber-400 font-medium transition-colors">
                                    Live auctions
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Community & Process */}
                    <div>
                        <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[var(--text-main)] mb-4">
                            Platform &amp; Story
                        </h3>
                        <ul className="space-y-2.5 text-xs font-sans">
                            <li>
                                <Link to="/how-it-works" className="text-[var(--text-muted)] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                                    How It Works
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-[var(--text-muted)] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                                    Our Mission &amp; Impact
                                </Link>
                            </li>
                            <li>
                                <Link to="/register" className="text-[var(--text-muted)] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                                    Become a Producer / Seller
                                </Link>
                            </li>
                            <li>
                                <Link to="/profile" className="text-[var(--text-muted)] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                                    Account Profile
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Producers / Seller CTA */}
                    <div className="space-y-4">
                        <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[var(--text-main)] mb-4">
                            Artisans &amp; Growers
                        </h3>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed font-sans">
                            Are you an independent producer using circular, organic, or low-footprint methods?
                        </p>
                        <Link
                            to="/register"
                            className="btn-primary inline-flex items-center justify-center gap-2 w-full py-2.5 text-xs font-semibold"
                        >
                            <span>Open Your Seller Studio</span>
                            <span>→</span>
                        </Link>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="pt-12 mt-12 border-t border-[var(--border-card)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)] font-sans">
                    <p>© {new Date().getFullYear()} SustainMarket. Dedicated to zero-waste local trade.</p>
                    <div className="flex gap-6">
                        <Link to="/about" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Principles</Link>
                        <Link to="/how-it-works" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Secure payments</Link>
                        <Link to="/marketplace" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Catalog</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
