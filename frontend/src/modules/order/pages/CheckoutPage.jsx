import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../cart/store/cartStore';
import { useCreateOrder } from '../services/orderQueries';
import toast from 'react-hot-toast';

const StepIndicator = ({ step }) => {
    const steps = ['01 Delivery Details', '02 Payment', '03 Confirmation'];
    return (
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-8 text-xs font-sans">
            {steps.map((label, i) => {
                const idx = i + 1;
                const active = step === idx;
                const done = step > idx;
                return (
                    <div key={label} className="flex items-center gap-2 sm:gap-3">
                        <div className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                            active
                                ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-md shadow-emerald-600/20'
                                : done
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                : 'bg-black/5 dark:bg-white/5 text-[var(--text-muted)] border-[var(--border-card)]'
                        }`}>
                            {done ? `✓ ${label}` : label}
                        </div>
                        {i < steps.length - 1 && (
                            <span className="text-[var(--text-muted)] opacity-40 font-bold">→</span>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { cart, getCartTotal } = useCartStore();
    const { mutate: createOrder, isPending } = useCreateOrder();

    const [shippingAddress, setShippingAddress] = useState({
        fullName: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
    });

    const handleCreateOrder = (e) => {
        if (e) e.preventDefault();
        if (cart.length === 0 || isPending) return;

        const items = cart.map(item => ({
            productId: item._id,
            quantity: item.quantity
        }));

        createOrder(
            {
                items,
                shippingAddress: shippingAddress.street ? shippingAddress : undefined
            },
            {
                onSuccess: (res) => {
                    const orderId = res.data?._id || res.data?.id;
                    toast.success("Order registered. Proceeding to payment...");
                    navigate(`/payment/${orderId}`);
                },
                onError: (err) => {
                    const errMsg = err?.response?.data?.error || err?.response?.data?.message || 'Failed to place order. Please try again.';
                    toast.error(errMsg);
                }
            }
        );
    };

    if (cart.length === 0) return (
        <div className="min-h-[75vh] flex items-center justify-center px-4 bg-[var(--bg-page)] text-[var(--text-main)]">
            <div className="glass-card p-10 text-center max-w-md space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold font-display text-[var(--text-main)]">Your cart is empty</h2>
                <p className="text-xs text-[var(--text-muted)] font-sans">
                    Please add verified artisan or organic goods before proceeding to checkout.
                </p>
                <Link to="/marketplace" className="btn-primary inline-block px-5 py-2.5 text-xs font-semibold">
                    Browse Marketplace →
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-3xl mx-auto space-y-8">
                
                {/* Step Indicator */}
                <StepIndicator step={1} />

                <div className="text-center space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-[var(--text-main)]">
                        Delivery &amp; Order Review
                    </h1>
                    <p className="text-xs text-[var(--text-muted)] font-sans">
                        Confirm your delivery address for verified carbon-neutral transit.
                    </p>
                </div>

                <form onSubmit={handleCreateOrder} className="space-y-6">
                    {/* Shipping Address Inputs */}
                    <div className="glass-card p-6 space-y-4">
                        <h2 className="text-sm font-bold font-display text-[var(--text-main)] border-b border-[var(--border-card)] pb-3">
                            Recipient Information
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Aarav Sharma"
                                    value={shippingAddress.fullName}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                                    className="w-full px-3 py-2 text-xs bg-black/5 dark:bg-white/5 border border-[var(--border-card)] rounded-lg text-[var(--text-main)] focus:outline-none focus:border-emerald-500 font-sans"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Phone Contact</label>
                                <input
                                    type="tel"
                                    required
                                    placeholder="+91 98765 43210"
                                    value={shippingAddress.phone}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                                    className="w-full px-3 py-2 text-xs bg-black/5 dark:bg-white/5 border border-[var(--border-card)] rounded-lg text-[var(--text-main)] focus:outline-none focus:border-emerald-500 font-sans"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Street Address</label>
                            <input
                                type="text"
                                required
                                placeholder="House / Flat No., Street, Landmark"
                                value={shippingAddress.street}
                                onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                                className="w-full px-3 py-2 text-xs bg-black/5 dark:bg-white/5 border border-[var(--border-card)] rounded-lg text-[var(--text-main)] focus:outline-none focus:border-emerald-500 font-sans"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">City</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="City"
                                    value={shippingAddress.city}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                                    className="w-full px-3 py-2 text-xs bg-black/5 dark:bg-white/5 border border-[var(--border-card)] rounded-lg text-[var(--text-main)] focus:outline-none focus:border-emerald-500 font-sans"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">State</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="State"
                                    value={shippingAddress.state}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                                    className="w-full px-3 py-2 text-xs bg-black/5 dark:bg-white/5 border border-[var(--border-card)] rounded-lg text-[var(--text-main)] focus:outline-none focus:border-emerald-500 font-sans"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">PIN Code</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="6 digits"
                                    value={shippingAddress.postalCode}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                                    className="w-full px-3 py-2 text-xs bg-black/5 dark:bg-white/5 border border-[var(--border-card)] rounded-lg text-[var(--text-main)] focus:outline-none focus:border-emerald-500 font-sans"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Order Items Review */}
                    <div className="glass-card p-6 space-y-4">
                        <h2 className="text-sm font-bold font-display text-[var(--text-main)] border-b border-[var(--border-card)] pb-3">
                            Review Items ({cart.length})
                        </h2>

                        <div className="divide-y divide-[var(--border-card)]">
                            {cart.map((item) => (
                                <div key={item._id} className="py-3 flex items-center justify-between text-xs font-sans">
                                    <div>
                                        <p className="font-bold text-[var(--text-main)]">{item.title}</p>
                                        <p className="text-[var(--text-muted)] font-mono">Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}</p>
                                    </div>
                                    <span className="font-mono font-bold text-[var(--text-main)]">
                                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-[var(--border-card)] flex items-baseline justify-between font-mono">
                            <span className="font-bold text-sm text-[var(--text-main)]">ORDER TOTAL</span>
                            <span className="font-black text-2xl text-emerald-600 dark:text-emerald-400">
                                ₹{getCartTotal().toLocaleString('en-IN')}
                            </span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="btn-primary w-full py-4 text-xs font-bold uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                    >
                        {isPending ? 'Generating Order...' : 'Proceed to Payment Authorization →'}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default CheckoutPage;
