import { Link } from 'react-router-dom';
import { memo, useState } from 'react';
import ScoreGauge from '../../../shared/components/ScoreGauge';
import { useCartStore } from '../../cart/store/cartStore';
import toast from 'react-hot-toast';

const ProductCard = memo(({ product }) => {
    const addToCart = useCartStore((s) => s.addToCart);
    const [added, setAdded] = useState(false);

    if (!product) return null;

    const handleQuickAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product, 1);
        setAdded(true);
        toast.success(`✓ Added ${product.title} to cart`);
        setTimeout(() => setAdded(false), 1200);
    };

    return (
        <Link to={`/products/${product._id}`} className="block group h-full focus:outline-none">
            <div className="h-full glass-card hover-card-trigger glass-shimmer overflow-hidden flex flex-col">
                
                {/* Product Image Area */}
                <div className="relative h-48 sm:h-52 bg-black/5 dark:bg-white/5 overflow-hidden flex-shrink-0 border-b border-[var(--border-card)]">
                    {product.images && product.images.length > 0 ? (
                        <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                            <svg className="w-10 h-10 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2a9 9 0 0 1 9 9c0 4.97-4.03 9-9 9A9 9 0 0 1 3 11C3 6.03 7.03 2 12 2z" />
                                <path d="M12 2v20" />
                            </svg>
                        </div>
                    )}

                    {/* Top Left: Category Tag */}
                    <div className="absolute top-2.5 left-2.5 bg-[var(--bg-surface)]/90 backdrop-blur-md text-[var(--text-muted)] text-xs font-mono font-medium px-2 py-0.5 rounded-full border border-[var(--border-card)] uppercase shadow-sm">
                        {product.category || 'General'}
                    </div>

                    {/* Top Right: Sustainability Radial Gauge */}
                    {product.sustainabilityScore !== undefined && (
                        <div className="absolute top-2 right-2 p-1 rounded-full bg-[var(--bg-surface)]/90 backdrop-blur-md border border-[var(--border-card)] shadow-sm">
                            <ScoreGauge score={product.sustainabilityScore} size="sm" showLabel={false} />
                        </div>
                    )}

                    {/* Live Auction Ribbon if active */}
                    {product.biddingEnabled && (
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-[#041c15] text-xs font-mono font-black shadow-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#041c15] animate-pulse" />
                            <span>AUCTION ACTIVE</span>
                        </div>
                    )}
                </div>

                {/* Content Area */}
                <div className="p-4 flex flex-col flex-grow space-y-2">
                    {/* Seller Origin */}
                    {product.sellerId?.name && (
                        <p className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider truncate">
                            Artisan: {product.sellerId.name}
                        </p>
                    )}

                    {/* Title */}
                    <h3 className="text-sm font-bold font-display text-[var(--text-main)] line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                        {product.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed font-sans flex-grow">
                        {product.description}
                    </p>

                    {/* Reviews / Rating */}
                    {product.averageRating > 0 && (
                        <div className="flex items-center gap-1.5 text-xs">
                            <div className="flex text-amber-500">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <svg
                                        key={star}
                                        className={`w-3 h-3 ${star <= Math.round(product.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-zinc-300 dark:text-zinc-700'}`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <span className="text-xs font-mono text-[var(--text-muted)]">
                                ({product.totalReviews || 0})
                            </span>
                        </div>
                    )}

                    {/* Price and Action Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-[var(--border-card)] mt-auto">
                        <div>
                            <span className="text-base font-bold font-mono text-[var(--text-main)]">
                                ₹{product.price?.toLocaleString('en-IN')}
                            </span>
                        </div>

                        {/* Quick Add or View Auction */}
                        {product.biddingEnabled ? (
                            <span className="text-xs font-mono font-bold text-amber-500 hover:text-amber-400 uppercase tracking-wider">
                                View Bid →
                            </span>
                        ) : (
                            <button
                                type="button"
                                onClick={handleQuickAdd}
                                className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                                    added
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white'
                                }`}
                                aria-label={`Add ${product.title} to cart`}
                            >
                                {added ? '✓ Added' : '+ Cart'}
                            </button>
                        )}
                    </div>

                </div>

            </div>
        </Link>
    );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
