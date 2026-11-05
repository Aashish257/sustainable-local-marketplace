import { Link } from 'react-router-dom';

const HowItWorksPage = () => {
    return (
        <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-16">
                
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium text-xs uppercase tracking-wider">
                        <span>How it works</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black font-display tracking-tight text-[var(--text-main)]">
                        How Sustainable Commerce Works
                    </h1>
                    <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-2xl mx-auto font-sans leading-relaxed">
                        A seamless, transparent journey from local seed to doorstep delivery. Designed to measure every gram of carbon prevented.
                    </p>
                </div>

                {/* For Buyers */}
                <div className="space-y-8">
                    <div className="border-b border-[var(--border-card)] pb-3">
                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">01 // BUYER JOURNEY</span>
                        <h2 className="text-2xl font-bold font-display text-[var(--text-main)] mt-1">Conscious Consumption Made Simple</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="glass-card p-5 space-y-3">
                            <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">01</span>
                            <h3 className="text-base font-bold font-display">Discover Local</h3>
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                Browse items by category, distance, and certified eco scores. Compare carbon metrics before choosing.
                            </p>
                        </div>

                        <div className="glass-card p-5 space-y-3">
                            <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">02</span>
                            <h3 className="text-base font-bold font-display">Bid or Buy Direct</h3>
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                Join real-time WebSocket auctions for unique artisan drops or instantly purchase everyday organic goods.
                            </p>
                        </div>

                        <div className="glass-card p-5 space-y-3">
                            <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">03</span>
                            <h3 className="text-base font-bold font-display">Secure checkout</h3>
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                Complete checkout via verified Razorpay gateway. Stock is reserved the moment your payment succeeds.
                            </p>
                        </div>

                        <div className="glass-card p-5 space-y-3">
                            <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">04</span>
                            <h3 className="text-base font-bold font-display">Track &amp; Offset</h3>
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                Receive your net-zero certificate, track orders with live milestones, and leave verified peer reviews.
                            </p>
                        </div>
                    </div>
                </div>

                {/* For Sellers */}
                <div className="space-y-8">
                    <div className="border-b border-[var(--border-card)] pb-3">
                        <span className="text-xs font-mono font-bold text-amber-500 tracking-wider uppercase">02 // SELLER JOURNEY</span>
                        <h2 className="text-2xl font-bold font-display text-[var(--text-main)] mt-1">Empowering Local Producers</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-card p-5 space-y-3">
                            <span className="text-3xl font-black font-mono text-amber-500">A</span>
                            <h3 className="text-base font-bold font-display">List in Minutes</h3>
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                Define your product details, upload craft images, and set your 4-axis sustainability parameters in our intuitive Seller Studio.
                            </p>
                        </div>

                        <div className="glass-card p-5 space-y-3">
                            <span className="text-3xl font-black font-mono text-amber-500">B</span>
                            <h3 className="text-base font-bold font-display">Direct Engagement</h3>
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                Message conscious buyers directly via encrypted P2P chat, answer harvest questions, and host live bidding auctions.
                            </p>
                        </div>

                        <div className="glass-card p-5 space-y-3">
                            <span className="text-3xl font-black font-mono text-amber-500">C</span>
                            <h3 className="text-base font-bold font-display">Fulfill &amp; Grow</h3>
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                Update dispatch milestones with one click, receive immediate payouts, and monitor sales analytics on your live dashboard.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center pt-6">
                    <Link to="/marketplace" className="btn-primary px-8 py-3.5 text-sm font-semibold inline-flex items-center gap-2">
                        Get Started in the Marketplace
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default HowItWorksPage;
