import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../modules/cart/store/cartStore';
import useAuthStore from '../../store/authStore';

const CartDrawer = ({ isOpen, onClose }) => {
    const { cart, removeFromCart, updateQuantity, getCartTotal } = useCartStore();
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const drawerRef = useRef(null);

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    // Prevent body scroll when open
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleCheckout = () => {
        onClose();
        navigate('/checkout');
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-50 transition-all duration-400 ${isOpen ? 'visible' : 'invisible'}`}
                onClick={onClose}
                aria-hidden="true"
            >
                <div className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
            </div>

            {/* Drawer Panel */}
            <div
                ref={drawerRef}
                role="dialog"
                aria-modal="true"
                aria-label="Your Cart"
                className={`fixed right-0 top-0 h-full z-50 w-full sm:w-96 flex flex-col
                    bg-[var(--bg-surface)] border-l border-[var(--border-card)]
                    shadow-2xl transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-card)] bg-[var(--bg-surface)]/90 backdrop-blur-md flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <path d="M16 10a4 4 0 01-8 0" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="font-bold font-display text-[var(--text-main)] text-base">Your Cart</h2>
                            <p className="text-xs text-[var(--text-muted)] font-mono">{cart.length} {cart.length === 1 ? 'item' : 'items'}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close cart"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
                            <div className="w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                                <svg className="w-10 h-10 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-slate-700 dark:text-slate-300 font-bold text-base">Your cart is empty</p>
                                <p className="text-slate-400 text-sm mt-1">Discover eco-friendly products for a better planet.</p>
                            </div>
                            <Link
                                to="/products"
                                onClick={onClose}
                                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-200 dark:shadow-none"
                            >
                                Browse Catalog
                            </Link>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item._id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 group">
                                {/* Thumbnail */}
                                <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-700 flex-shrink-0 overflow-hidden">
                                    {item.image ? (
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2 22s6-2 10-6c4-4 10-10 10-10s-4 0-8 4-10 12-10 12zm7-7l6-6" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{item.title}</p>
                                    <p className="text-emerald-600 font-black text-sm mt-0.5">₹{(item.price * item.quantity).toLocaleString()}</p>
                                    {/* Qty Stepper */}
                                    <div className="flex items-center gap-2 mt-2">
                                        <button
                                            onClick={() => updateQuantity(item._id, -1)}
                                            aria-label={`Decrease quantity of ${item.title}`}
                                            className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-700 transition-all font-bold text-sm"
                                        >−</button>
                                        <span className="text-sm font-black text-slate-700 dark:text-slate-200 min-w-[1.5rem] text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item._id, 1)}
                                            aria-label={`Increase quantity of ${item.title}`}
                                            className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-700 transition-all font-bold text-sm"
                                        >+</button>
                                    </div>
                                </div>

                                {/* Remove */}
                                <button
                                    onClick={() => removeFromCart(item._id)}
                                    aria-label={`Remove ${item.title} from cart`}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                    <div className="flex-shrink-0 border-t border-slate-100 dark:border-slate-700/50 px-6 py-5 space-y-4 bg-white/80 dark:bg-[#0a1a12]/80 backdrop-blur-md">
                        {/* Cart not saved warning */}
                        <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-lg border border-amber-100 dark:border-amber-900/50 font-medium text-center">
                            Your cart is saved on this device.
                        </p>

                        {/* Subtotal */}
                        <div className="flex items-center justify-between">
                            <span className="text-slate-600 dark:text-slate-300 font-semibold text-sm">Subtotal</span>
                            <span className="text-slate-900 dark:text-slate-100 font-black text-xl">₹{getCartTotal().toLocaleString()}</span>
                        </div>

                        {/* CTA */}
                        {isAuthenticated ? (
                            <button
                                onClick={handleCheckout}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-none transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 text-sm tracking-wide"
                            >
                                Proceed to Checkout →
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                onClick={onClose}
                                className="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-none transition-all duration-300 text-sm"
                            >
                                Login to Checkout
                            </Link>
                        )}
                        <button
                            onClick={onClose}
                            className="w-full text-center text-slate-500 dark:text-slate-400 font-semibold text-sm hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-1"
                        >
                            Continue Shopping
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartDrawer;
