import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import ThreeImpactSphere from '../../../shared/components/ThreeImpactSphere';
import EmptyState from '../../../shared/components/EmptyState';

const CartPage = () => {
    const navigate = useNavigate();
    const { cart, removeFromCart, updateQuantity, getCartTotal } = useCartStore();

    const totalEcoSavings = cart.reduce((sum, item) => {
        return sum + ((item.sustainabilityScore || 0) * item.quantity * 0.15);
    }, 0);

    // Empty Cart
    if (cart.length === 0) {
        return (
            <div className="min-h-[75vh] flex items-center justify-center px-4 bg-[var(--bg-page)] text-[var(--text-main)]">
                <EmptyState
                    title="Your cart is empty"
                    description="Discover eco-friendly products and circular artisan crafts for a better planet."
                    actionLabel="Explore Marketplace"
                    actionLink="/marketplace"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-4">
                    <div className="flex items-center gap-3">
                        <Link to="/marketplace" className="text-[var(--text-muted)] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                            ← Back to Catalog
                        </Link>
                        <span className="text-[var(--border-card)]">|</span>
                        <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-[var(--text-main)]">
                            Your Shopping Cart
                        </h1>
                    </div>
                    <span className="text-xs font-mono text-[var(--text-muted)]">
                        {cart.length} {cart.length === 1 ? 'ITEM' : 'ITEMS'}
                    </span>
                </div>

                {/* 2-Column Desktop Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: Cart Items List */}
                    <div className="lg:col-span-8 space-y-4">
                        {cart.map((item) => (
                            <div
                                key={item._id}
                                className="glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Thumbnail */}
                                    <div className="w-20 h-20 rounded-xl bg-black/5 dark:bg-white/5 overflow-hidden flex-shrink-0 border border-[var(--border-card)]">
                                        {item.image || item.images?.[0] ? (
                                            <img
                                                src={item.image || item.images?.[0]}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                                                <svg className="w-6 h-6 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2a9 9 0 0 1 9 9c0 4.97-4.03 9-9 9A9 9 0 0 1 3 11C3 6.03 7.03 2 12 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="space-y-1 min-w-0">
                                        <Link
                                            to={`/products/${item._id}`}
                                            className="font-bold text-sm text-[var(--text-main)] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors line-clamp-1 font-display"
                                        >
                                            {item.title}
                                        </Link>
                                        <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                            ₹{item.price?.toLocaleString('en-IN')} each
                                        </p>
                                        {item.sustainabilityScore && (
                                            <span className="inline-block text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                                ECO: {item.sustainabilityScore}/10
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Controls: Stepper, Total, Remove */}
                                <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--border-card)]">
                                    {/* Stepper */}
                                    <div className="flex items-center gap-2 font-mono">
                                        <button
                                            onClick={() => updateQuantity(item._id, -1)}
                                            className="w-7 h-7 rounded-lg border border-[var(--border-card)] flex items-center justify-center text-xs hover:border-emerald-500 transition-colors cursor-pointer"
                                        >
                                            −
                                        </button>
                                        <span className="font-bold text-xs w-6 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item._id, 1)}
                                            className="w-7 h-7 rounded-lg border border-[var(--border-card)] flex items-center justify-center text-xs hover:border-emerald-500 transition-colors cursor-pointer"
                                        >
                                            +
                                        </button>
                                    </div>

                                    {/* Line Total */}
                                    <div className="text-right font-mono min-w-[70px]">
                                        <span className="font-bold text-sm text-[var(--text-main)]">
                                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                        </span>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => removeFromCart(item._id)}
                                        className="text-[var(--text-muted)] hover:text-rose-500 transition-colors p-1 cursor-pointer"
                                        aria-label={`Remove ${item.title}`}
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Column: Order Summary & 3D Impact */}
                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                        
                        {/* Summary Card */}
                        <div className="glass-card p-6 space-y-4">
                            <h2 className="text-base font-bold font-display text-[var(--text-main)] border-b border-[var(--border-card)] pb-3">
                                Order Summary
                            </h2>

                            <div className="space-y-2 text-xs font-sans">
                                <div className="flex justify-between text-[var(--text-muted)]">
                                    <span>Items Subtotal</span>
                                    <span className="font-mono text-[var(--text-main)]">₹{getCartTotal().toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-[var(--text-muted)]">
                                    <span>Delivery</span>
                                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">FREE</span>
                                </div>
                                <div className="flex justify-between text-[var(--text-muted)]">
                                    <span>Plastic-Free Packaging</span>
                                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">INCLUDED</span>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-[var(--border-card)] flex justify-between items-baseline font-mono">
                                <span className="font-bold text-sm text-[var(--text-main)]">TOTAL</span>
                                <span className="font-black text-2xl text-emerald-600 dark:text-emerald-400">
                                    ₹{getCartTotal().toLocaleString('en-IN')}
                                </span>
                            </div>

                            <button
                                onClick={() => navigate('/checkout')}
                                className="btn-primary w-full py-3.5 text-xs uppercase font-bold tracking-wider cursor-pointer"
                            >
                                Proceed to Checkout →
                            </button>

                            <Link
                                to="/marketplace"
                                className="block text-center text-xs text-[var(--text-muted)] hover:text-emerald-600 dark:hover:text-emerald-400 pt-1"
                            >
                                Continue Shopping
                            </Link>
                        </div>

                        {/* 3D Impact Orb Visualization */}
                        <div className="glass-card p-5 space-y-3 text-center">
                            <div className="flex items-center justify-between text-xs border-b border-[var(--border-card)] pb-2">
                                <span className="font-bold font-display text-[var(--text-main)]">Basket Carbon Offset</span>
                                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                    ~{totalEcoSavings.toFixed(1)}kg CO₂
                                </span>
                            </div>

                            <div className="h-40 relative flex items-center justify-center overflow-hidden">
                                <ThreeImpactSphere co2Saved={totalEcoSavings} />
                            </div>

                            <p className="text-xs text-[var(--text-muted)] font-sans leading-relaxed">
                                Purchasing this local selection actively eliminates non-recyclable transport packaging.
                            </p>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
};

export default CartPage;
