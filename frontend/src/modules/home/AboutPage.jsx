import { Link } from 'react-router-dom';

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-16">
                
                {/* Hero Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium text-xs uppercase tracking-wider">
                        <span>Our mission</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black font-display tracking-tight text-[var(--text-main)]">
                        Connecting People with <span className="text-emerald-600 dark:text-emerald-400">Pure Local Origins</span>
                    </h1>
                    <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-2xl mx-auto font-sans leading-relaxed">
                        We believe that sustainable commerce begins right in our own backyards. By empowering local organic growers, zero-waste crafters, and circular artisans, we eliminate excessive transport emissions and restore community trust.
                    </p>
                </div>

                {/* Core Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-6 space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold font-display text-[var(--text-main)]">100% Origin Traceability</h3>
                        <p className="text-sm text-[var(--text-muted)] leading-relaxed font-sans">
                            Every producer is verified with proven local practices. Know precisely who grew your food or handcrafted your everyday goods.
                        </p>
                    </div>

                    <div className="glass-card p-6 space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold font-display text-[var(--text-main)]">Zero Middlemen</h3>
                        <p className="text-sm text-[var(--text-muted)] leading-relaxed font-sans">
                            Fair prices for conscious buyers and living wages for independent makers. Direct peer-to-peer relationships foster long-term community resilience.
                        </p>
                    </div>

                    <div className="glass-card p-6 space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold font-display text-[var(--text-main)]">Audited Eco Scoring</h3>
                        <p className="text-sm text-[var(--text-muted)] leading-relaxed font-sans">
                            Our proprietary 0–10 Sustainability Rating evaluates sourcing distance, biodegradable packaging, and renewable energy usage.
                        </p>
                    </div>
                </div>

                {/* Call to action */}
                <div className="glass-card p-8 text-center space-y-6 bg-gradient-to-br from-emerald-900/20 to-transparent border-emerald-500/25">
                    <h2 className="text-2xl sm:text-3xl font-bold font-display text-[var(--text-main)]">
                        Ready to join the local circular economy?
                    </h2>
                    <p className="text-sm text-[var(--text-muted)] max-w-xl mx-auto font-sans">
                        Whether you are an artisan seeking an honest channel or a buyer striving to tread lighter, there is a place for you here.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 pt-2">
                        <Link to="/marketplace" className="btn-primary px-6 py-3 text-sm font-semibold">
                            Explore Marketplace →
                        </Link>
                        <Link to="/register" className="btn-secondary px-6 py-3 text-sm font-semibold">
                            Join as a Seller
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AboutPage;
