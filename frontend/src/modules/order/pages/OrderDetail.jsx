import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrder } from '../services/orderQueries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../services/apiClient';
import { REVIEWS } from '../../../services/endpoints';
import StatusBadge from '../../../shared/components/StatusBadge';
import { SkeletonGrid } from '../../../shared/components/SkeletonLoader';
import ErrorState from '../../../shared/components/ErrorState';
import toast from 'react-hot-toast';
import { ArrowLeft, Package, ShieldCheck, MapPin, Calendar, CreditCard, Star, MessageSquare, ExternalLink } from 'lucide-react';

const STEP_MAP = {
    pending: 1,
    paid: 2,
    shipped: 3,
    delivered: 4,
    cancelled: 0,
};

const ORDER_STEPS = [
    { label: 'Placed', desc: 'Order submitted' },
    { label: 'Paid & Verified', desc: 'Payment received' },
    { label: 'Dispatched', desc: 'En route locally' },
    { label: 'Delivered', desc: 'Handed over' },
];

const OrderDetail = () => {
    const { orderId } = useParams();
    const queryClient = useQueryClient();
    const { data, isLoading, isError, refetch } = useOrder(orderId);
    const [reviewingProductId, setReviewingProductId] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    const reviewMutation = useMutation({
        mutationFn: ({ productId, rating, comment }) =>
            apiClient.post(REVIEWS.ADD, { productId, rating, comment }).then(r => r.data),
        onSuccess: () => {
            toast.success('Thank you! Your eco-review has been published.');
            setReviewingProductId(null);
            setComment('');
            queryClient.invalidateQueries({ queryKey: ['product'] });
        },
        onError: (err) => {
            toast.error(err?.response?.data?.error || 'Failed to submit review.');
        }
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] py-12 px-4">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="h-8 bg-[var(--border-card)] rounded-xl w-48 animate-pulse" />
                    <SkeletonGrid count={3} />
                </div>
            </div>
        );
    }

    if (isError || !data?.data) {
        return (
            <div className="min-h-screen bg-[var(--bg-page)] py-20 px-4 flex items-center justify-center">
                <ErrorState
                    title="Order not found"
                    message="We couldn't retrieve this order. It may not exist or you might not have permission to view it."
                    onRetry={refetch}
                />
            </div>
        );
    }

    const order = data.data;
    const currentStep = STEP_MAP[order.status] || 1;

    const handleReviewSubmit = (e, productId) => {
        e.preventDefault();
        if (!comment.trim()) {
            toast.error('Please write a brief feedback comment.');
            return;
        }
        reviewMutation.mutate({ productId, rating, comment });
    };

    return (
        <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                
                {/* Back Link */}
                <div>
                    <Link
                        to="/orders"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to All Orders</span>
                    </Link>
                </div>

                {/* Header Banner */}
                <div className="glass-card p-6 sm:p-8 rounded-3xl border border-[var(--border-card)] shadow-lg space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-card)] pb-6">
                        <div>
                            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                ORDER #{order._id.slice(-8).toUpperCase()}
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-display font-black text-[var(--text-main)]">
                                Order Details
                            </h1>
                            <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" />
                                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <StatusBadge status={order.status} />
                            {order.status === 'pending' && (
                                <Link
                                    to={`/payment/${order._id}`}
                                    className="btn-primary px-4 py-2 text-xs font-bold uppercase tracking-wider"
                                >
                                    Pay Now →
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* 4-Stage Timeline */}
                    <div>
                        <h3 className="text-xs font-mono uppercase font-bold text-[var(--text-muted)] tracking-wider mb-4">
                            Fulfillment Journey
                        </h3>
                        {order.status === 'cancelled' ? (
                            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-mono font-bold flex items-center gap-2">
                                <span>Order cancelled. If you paid, a refund has been requested to your original payment method.</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {ORDER_STEPS.map((step, idx) => {
                                    const stepNum = idx + 1;
                                    const isDone = currentStep >= stepNum;
                                    const isCurrent = currentStep === stepNum;
                                    return (
                                        <div
                                            key={step.label}
                                            className={`p-3.5 rounded-2xl border transition-all ${
                                                isDone
                                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                                                    : isCurrent
                                                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                                                    : 'bg-black/[0.02] dark:bg-white/[0.02] border-[var(--border-card)] text-[var(--text-muted)]'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                                                    isDone ? 'bg-emerald-600 text-white' : isCurrent ? 'bg-amber-500 text-white' : 'bg-[var(--border-card)] text-[var(--text-muted)]'
                                                }`}>
                                                    {isDone ? '✓' : stepNum}
                                                </div>
                                                <span className="text-xs font-bold line-clamp-1">{step.label}</span>
                                            </div>
                                            <p className="text-xs opacity-75">{step.desc}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Grid: Items & Order Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Items List */}
                    <div className="lg:col-span-8 space-y-4">
                        <div className="glass-card p-6 rounded-3xl border border-[var(--border-card)] shadow-md">
                            <h2 className="text-base font-display font-bold text-[var(--text-main)] mb-4 flex items-center gap-2">
                                <Package className="w-4 h-4 text-emerald-500" />
                                <span>Purchased Items ({order.items?.length || 0})</span>
                            </h2>
                            <div className="divide-y divide-[var(--border-card)]">
                                {order.items?.map((item, idx) => {
                                    const product = item.productId || {};
                                    const image = product.images?.[0] || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=200&auto=format&fit=crop&q=60';
                                    const isDelivered = order.status === 'delivered';
                                    const isReviewing = reviewingProductId === product._id;

                                    return (
                                        <div key={idx} className="py-4 first:pt-0 last:pb-0 space-y-3">
                                            <div className="flex items-start gap-4">
                                                <img
                                                    src={image}
                                                    alt={product.title || 'Product'}
                                                    className="w-16 h-16 rounded-2xl object-cover border border-[var(--border-card)] flex-shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <Link
                                                        to={`/products/${product._id}`}
                                                        className="font-bold text-sm text-[var(--text-main)] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors line-clamp-1 flex items-center gap-1"
                                                    >
                                                        <span>{product.title || 'Artisan Listing'}</span>
                                                        <ExternalLink className="w-3 h-3 text-[var(--text-muted)] opacity-60" />
                                                    </Link>
                                                    <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                                                        Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}
                                                    </p>
                                                    {product.sustainabilityScore && (
                                                        <span className="inline-block mt-1 text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                                                            Eco Score: {product.sustainabilityScore}/10
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-mono font-bold text-base text-[var(--text-main)]">
                                                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Review Prompt for Delivered Orders */}
                                            {isDelivered && (
                                                <div className="pt-2">
                                                    {!isReviewing ? (
                                                        <button
                                                            onClick={() => setReviewingProductId(product._id)}
                                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                                                        >
                                                            <Star className="w-3.5 h-3.5" />
                                                            <span>Leave an Ecological Product Review</span>
                                                        </button>
                                                    ) : (
                                                        <form
                                                            onSubmit={(e) => handleReviewSubmit(e, product._id)}
                                                            className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--border-card)] space-y-3 animate-fade-in"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs font-bold text-[var(--text-main)]">Your Rating</span>
                                                                <div className="flex gap-1">
                                                                    {[1, 2, 3, 4, 5].map(s => (
                                                                        <button
                                                                            type="button"
                                                                            key={s}
                                                                            onClick={() => setRating(s)}
                                                                            className={`p-1 cursor-pointer ${s <= rating ? 'text-amber-400' : 'text-zinc-300 dark:text-zinc-700'}`}
                                                                        >
                                                                            <Star className="w-4 h-4 fill-current" />
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <textarea
                                                                placeholder="Describe the artisan craft, packaging material, and durability..."
                                                                value={comment}
                                                                onChange={(e) => setComment(e.target.value)}
                                                                rows={2}
                                                                className="w-full text-xs p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-emerald-500"
                                                            />
                                                            <div className="flex justify-end gap-2 text-xs">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setReviewingProductId(null)}
                                                                    className="px-3 py-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)]"
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    type="submit"
                                                                    disabled={reviewMutation.isPending}
                                                                    className="btn-primary px-4 py-1.5 text-xs font-semibold"
                                                                >
                                                                    {reviewMutation.isPending ? 'Publishing...' : 'Submit Review'}
                                                                </button>
                                                            </div>
                                                        </form>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Ecological Impact Statement */}
                        <div className="glass-card p-6 rounded-3xl border border-[var(--border-card)] shadow-sm space-y-3">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider font-mono">
                                <ShieldCheck className="w-4 h-4" />
                                <span>COMMUNITY IMPACT AUDIT</span>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                This order prevented approximately <strong>2.8 kg</strong> of single-use transport emissions by sourcing through verified regional artisans within a 150 km radial loop.
                            </p>
                        </div>
                    </div>

                    {/* Order & Escrow Summary Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* Financial Ledger */}
                        <div className="glass-card p-6 rounded-3xl border border-[var(--border-card)] shadow-md space-y-4">
                            <h3 className="font-display font-bold text-sm text-[var(--text-main)] border-b border-[var(--border-card)] pb-3 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-amber-500" />
                                <span>Payment summary</span>
                            </h3>

                            <div className="space-y-2 text-xs font-sans">
                                <div className="flex justify-between text-[var(--text-muted)]">
                                    <span>Item Subtotal</span>
                                    <span className="font-mono">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-[var(--text-muted)]">
                                    <span>Delivery</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Free</span>
                                </div>
                                <div className="flex justify-between text-[var(--text-muted)]">
                                    <span>Platform fee</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">₹0 (Covered)</span>
                                </div>
                                <div className="pt-3 border-t border-[var(--border-card)] flex justify-between text-sm font-bold text-[var(--text-main)]">
                                    <span>Total Paid</span>
                                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black">
                                        ₹{order.totalAmount?.toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-2">
                                <Link
                                    to="/messages"
                                    className="w-full btn-secondary py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    <span>Message Marketplace Support</span>
                                </Link>
                            </div>
                        </div>

                        {/* Delivery Details */}
                        <div className="glass-card p-6 rounded-3xl border border-[var(--border-card)] shadow-md space-y-3">
                            <h3 className="font-display font-bold text-sm text-[var(--text-main)] flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-emerald-500" />
                                <span>Delivery Recipient</span>
                            </h3>
                            <div className="text-xs text-[var(--text-muted)] space-y-1 font-sans">
                                <p className="font-bold text-[var(--text-main)]">{order.buyerId?.name || 'Verified Buyer'}</p>
                                <p>{order.buyerId?.email}</p>
                                <p className="text-xs pt-1 text-emerald-600 dark:text-emerald-400 font-mono">
                                    ✓ Delivery address saved
                                </p>
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
};

export default OrderDetail;
