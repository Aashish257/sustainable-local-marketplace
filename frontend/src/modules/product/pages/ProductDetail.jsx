import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProduct } from '../services/productQueries';
import ProductGallery from '../components/ProductGallery';
import ProductInfo from '../components/ProductInfo';
import AddToCart from '../components/AddToCart';
import ReviewList from '../../review/components/ReviewList';
import ReviewForm from '../../review/components/ReviewForm';
import BidPanel from '../../bid/components/BidPanel';
import ChatBox from '../../chat/components/ChatBox';
import ScoreGauge from '../../../shared/components/ScoreGauge';
import ScoreRadar from '../../../shared/components/ScoreRadar';
import useAuthStore from '../../../store/authStore';
import { isShopper } from '../../../app/roles';
import { SkeletonDetail } from '../../../shared/components/SkeletonLoader';

const ProductDetail = () => {
    const { id } = useParams();
    const { user } = useAuthStore();

    const { data, isLoading, isError } = useProduct(id);
    const [isChatOpen, setIsChatOpen] = useState(false);

    if (isLoading) return <SkeletonDetail />;
    if (isError || !data?.data) return (
        <div className="text-center py-24 min-h-[60vh] flex flex-col items-center justify-center bg-[var(--bg-page)] text-[var(--text-main)]">
            <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center text-rose-500 mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold font-display text-[var(--text-main)]">Product Not Found</h2>
            <p className="text-[var(--text-muted)] text-xs mt-1 mb-6">This item may have expired or was removed from the catalog.</p>
            <Link to="/marketplace" className="btn-primary px-5 py-2.5 text-xs font-semibold">
                ← Return to Marketplace
            </Link>
        </div>
    );

    const product = data.data;
    const sellerId = product.sellerId?._id || product.sellerId;
    const sellerName = product.sellerId?.name || "Verified Producer";
    const isOwnProduct = user?.id === sellerId?.toString();
    const canShop = isShopper(user);

    return (
        <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] transition-colors duration-300 pb-24">
            
            {/* Breadcrumb Bar */}
            <div className="border-b border-[var(--border-card)] bg-[var(--bg-surface-elevated)]/40 py-3 px-4 sm:px-8 text-xs font-sans">
                <div className="max-w-7xl mx-auto flex items-center gap-2 text-[var(--text-muted)] truncate">
                    <Link to="/" className="hover:text-emerald-600 dark:hover:text-emerald-400">Home</Link>
                    <span>/</span>
                    <Link to="/marketplace" className="hover:text-emerald-600 dark:hover:text-emerald-400">Marketplace</Link>
                    <span>/</span>
                    {product.category && (
                        <>
                            <Link to={`/marketplace?category=${encodeURIComponent(product.category)}`} className="hover:text-emerald-600 dark:hover:text-emerald-400">
                                {product.category}
                            </Link>
                            <span>/</span>
                        </>
                    )}
                    <span className="text-[var(--text-main)] font-semibold truncate">{product.title}</span>
                </div>
            </div>

            {/* Main Product Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
                
                {/* Upper Section: Gallery + Commercial Details */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    
                    {/* Left Column: Image Gallery */}
                    <div className="lg:col-span-7">
                        <ProductGallery images={product.images} title={product.title} />
                    </div>

                    {/* Right Column: Sticky Commercial & Actions */}
                    <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                        
                        {/* Title & Seller info */}
                        <div className="glass-card p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                    {product.category || 'Sustainable Item'}
                                </span>
                                {product.biddingEnabled && (
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500 text-[#041c15]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#041c15] animate-pulse" />
                                        LIVE AUCTION
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-[var(--text-main)]">
                                {product.title}
                            </h1>

                            {/* Seller & Origin */}
                            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-card)]">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center font-bold text-xs text-emerald-600 dark:text-emerald-400 font-display">
                                        {sellerName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[var(--text-main)]">{sellerName}</p>
                                        <p className="text-xs font-mono text-[var(--text-muted)] uppercase">VERIFIED ARTISAN</p>
                                    </div>
                                </div>

                                {!isOwnProduct && (
                                    <button
                                        onClick={() => setIsChatOpen(!isChatOpen)}
                                        className="btn-secondary px-3 py-1.5 text-xs inline-flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <span>Message</span>
                                    </button>
                                )}
                            </div>

                            {/* Price */}
                            <div className="pt-3 border-t border-[var(--border-card)] flex items-baseline gap-3">
                                <span className="text-3xl font-black font-mono text-[var(--text-main)]">
                                    ₹{product.price?.toLocaleString('en-IN')}
                                </span>
                                <span className="text-xs text-[var(--text-muted)] font-mono">
                                    INCL. ALL TAXES
                                </span>
                            </div>

                            {/* Description */}
                            <p className="text-xs sm:text-sm text-[var(--text-muted)] font-sans leading-relaxed">
                                {product.description}
                            </p>

                            {/* Sellers/admins view listings; buying and bidding are buyer actions */}
                            {!canShop && (
                                <p className="pt-3 text-sm text-[var(--text-muted)]">
                                    You're viewing this listing as {user?.role === 'admin' ? 'an admin' : 'a seller'}. Buying and bidding are available to buyer accounts.
                                </p>
                            )}

                            {/* Cart / Buy Action */}
                            {canShop && !product.biddingEnabled && (
                                <div className="pt-3">
                                    <AddToCart product={product} />
                                </div>
                            )}

                            {/* Auction Live Terminal */}
                            {canShop && product.biddingEnabled && (
                                <div className="pt-2">
                                    <BidPanel product={product} />
                                </div>
                            )}
                        </div>

                    </div>

                </div>

                {/* Middle Section: Sustainability Radar & Provenance Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* ScoreRadar 4-Axis Graphic */}
                    <div className="lg:col-span-7">
                        <ScoreRadar baseScore={product.sustainabilityScore || 8.5} />
                    </div>

                    {/* Quantitative Provenance Highlights */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="glass-card p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <ScoreGauge score={product.sustainabilityScore || 8.5} size="md" />
                                <div>
                                    <h3 className="text-sm font-bold font-display text-[var(--text-main)]">Verified Environmental Index</h3>
                                    <p className="text-xs text-[var(--text-muted)] font-sans">Audited footprint &amp; circular materials</p>
                                </div>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-[var(--border-card)] text-xs font-sans">
                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                    <span>✓</span>
                                    <span>Zero single-use plastic in harvest or shipment</span>
                                </div>
                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                    <span>✓</span>
                                    <span>Local radius under 150km prevents transit emissions</span>
                                </div>
                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                    <span>✓</span>
                                    <span>Direct artisan escrow guarantees fair livelihood</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom Section: Customer Reviews & Ratings */}
                <div className="space-y-6 pt-6 border-t border-[var(--border-card)]">
                    <div>
                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                            COMMUNITY FEEDBACK
                        </span>
                        <h2 className="text-2xl font-bold font-display tracking-tight text-[var(--text-main)] mt-1">
                            Verified Customer Reviews
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-7">
                            <ReviewList productId={product._id} />
                        </div>
                        <div className="lg:col-span-5">
                            <ReviewForm productId={product._id} />
                        </div>
                    </div>
                </div>

            </div>

            {/* Direct P2P Chat Drawer */}
            {isChatOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsChatOpen(false)} />
                    <div className="relative w-full max-w-md h-full bg-[var(--bg-surface)] p-6 shadow-2xl z-10 flex flex-col">
                        <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-4 mb-4">
                            <div>
                                <h3 className="font-bold text-sm font-display text-[var(--text-main)]">Chat with {sellerName}</h3>
                                <p className="text-xs font-mono text-[var(--text-muted)]">P2P ENCRYPTED PROTOCOL</p>
                            </div>
                            <button onClick={() => setIsChatOpen(false)} className="text-sm font-bold cursor-pointer">✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <ChatBox receiverId={sellerId} receiverName={sellerName} />
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default ProductDetail;
