import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../services/apiClient';
import { ORDERS } from '../../../services/endpoints';
import { SkeletonGrid } from '../../../shared/components/SkeletonLoader';
import StatusBadge from '../../../shared/components/StatusBadge';
import EmptyState from '../../../shared/components/EmptyState';
import ErrorState from '../../../shared/components/ErrorState';
import { Link } from 'react-router-dom';

const STEP_MAP = {
    pending: 1,
    paid: 2,
    shipped: 3,
    delivered: 4,
    cancelled: 0,
};

const ORDER_STEPS = [
    { label: 'Placed', icon: '1' },
    { label: 'Paid & Verified', icon: '2' },
    { label: 'Dispatched', icon: '3' },
    { label: 'Delivered', icon: '4' },
];

const OrderTimeline = ({ status }) => {
    const currentStep = STEP_MAP[status] || 1;

    if (status === 'cancelled') {
        return (
            <div className="flex items-center gap-2 text-rose-500 text-xs font-mono font-semibold mt-3 pt-3 border-t border-[var(--border-card)]">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Order Cancelled
            </div>
        );
    }

    return (
        <div className="mt-3 pt-3 border-t border-[var(--border-card)]">
            <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
                {ORDER_STEPS.map((step, idx) => {
                    const stepNum = idx + 1;
                    const isDone = currentStep >= stepNum;
                    const isCurrent = currentStep === stepNum;

                    return (
                        <div key={step.label} className="flex items-center gap-2 flex-1 min-w-[90px]">
                            <div className="flex items-center gap-1.5">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                                    isDone
                                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                                        : isCurrent
                                        ? 'bg-amber-500 text-white animate-pulse'
                                        : 'bg-[var(--border-card)] text-[var(--text-muted)]'
                                }`}>
                                    {isDone ? '✓' : step.icon}
                                </div>
                                <span className={`text-xs font-medium whitespace-nowrap ${
                                    isDone
                                        ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                                        : isCurrent
                                        ? 'text-amber-600 dark:text-amber-400 font-semibold'
                                        : 'text-[var(--text-muted)]'
                                }`}>
                                    {step.label}
                                </span>
                            </div>
                            {idx < ORDER_STEPS.length - 1 && (
                                <div className={`flex-1 h-[2px] mx-1 rounded-full ${
                                    currentStep > stepNum ? 'bg-emerald-500' : 'bg-[var(--border-card)]'
                                }`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const MyOrders = () => {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['my-orders'],
        queryFn: () => apiClient.get(ORDERS.MY).then(r => r.data)
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] py-10 px-4">
                <div className="container mx-auto max-w-4xl space-y-6">
                    <div className="h-8 bg-[var(--border-card)] rounded-lg w-48 animate-pulse" />
                    <SkeletonGrid count={3} />
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-[var(--bg-page)] py-20 px-4 flex items-center justify-center">
                <ErrorState
                    title="Unable to load order history"
                    message="There was an issue communicating with the marketplace server. Please verify your connection."
                    onRetry={refetch}
                />
            </div>
        );
    }

    const orders = data?.data || [];

    return (
        <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] py-10 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-4xl space-y-6">
                
                {/* Header */}
                <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border-card)] pb-5">
                    <div>
                        <div className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-mono text-xs uppercase tracking-wider mb-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            ORDER FULFILLMENT TRACKER
                        </div>
                        <h1 className="text-3xl font-black font-display tracking-tight text-[var(--text-main)]">
                            Order History
                        </h1>
                    </div>
                    <p className="text-xs font-mono text-[var(--text-muted)]">
                        {orders.length} {orders.length === 1 ? 'TRANSACTION' : 'TRANSACTIONS'} RECORDED
                    </p>
                </div>

                {orders.length === 0 ? (
                    <EmptyState
                        title="No orders yet"
                        description="You haven't placed any sustainable marketplace orders yet. Explore our verified local listings to get started."
                        actionLabel="Browse Marketplace"
                        actionLink="/marketplace"
                    />
                ) : (
                    <div className="space-y-4">
                        {orders.map((order, idx) => (
                            <div
                                key={order._id}
                                className="glass-card overflow-hidden transition-all hover:border-emerald-500/30"
                            >
                                {/* Card Header */}
                                <div className="p-5 border-b border-[var(--border-card)] bg-black/[0.02] dark:bg-white/[0.02]">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex flex-wrap gap-6 font-mono text-xs">
                                            <div>
                                                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">ORDER DATE</p>
                                                <p className="font-bold text-[var(--text-main)] mt-0.5">
                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">TOTAL AMOUNT</p>
                                                <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                                    ₹{order.totalAmount?.toLocaleString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">ORDER REFERENCE</p>
                                                <p className="font-medium text-[var(--text-muted)] mt-0.5">
                                                    #{order._id.slice(-8).toUpperCase()}
                                                </p>
                                            </div>
                                        </div>

                                        <StatusBadge status={order.status} />
                                    </div>

                                    {/* Timeline */}
                                    <OrderTimeline status={order.status} />
                                </div>

                                {/* Items List */}
                                <div className="p-5 divide-y divide-[var(--border-card)]">
                                    {order.items?.map((item, itemIdx) => (
                                        <div key={itemIdx} className="py-3.5 first:pt-0 last:pb-0 flex gap-4 items-center">
                                            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--border-card)] border border-[var(--border-card)]">
                                                {item.productId?.images?.[0] ? (
                                                    <img
                                                        src={item.productId.images[0]}
                                                        alt={item.productId.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <Link
                                                    to={`/products/${item.productId?._id}`}
                                                    className="font-bold text-sm text-[var(--text-main)] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors line-clamp-1"
                                                >
                                                    {item.productId?.title || 'Catalog Product'}
                                                </Link>
                                                <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                                                    Qty: {item.quantity} × ₹{item.price?.toLocaleString()}
                                                </p>
                                            </div>
                                            <p className="font-mono font-bold text-sm text-[var(--text-main)] flex-shrink-0">
                                                ₹{(item.price * item.quantity).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Action Footer */}
                                <div className="p-4 bg-black/[0.02] dark:bg-white/[0.02] border-t border-[var(--border-card)] flex flex-wrap justify-between items-center gap-3">
                                    {order.status === 'pending' ? (
                                        <>
                                            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                Complete payment so the seller can ship your order
                                            </p>
                                            <Link
                                                to={`/payment/${order._id}`}
                                                className="btn-primary px-4 py-1.5 text-xs font-semibold"
                                            >
                                                Complete Payment →
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                Payment received
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    to={`/orders/${order._id}`}
                                                    className="btn-primary px-3 py-1.5 text-xs font-semibold"
                                                >
                                                    View Details →
                                                </Link>
                                                <Link
                                                    to="/messages"
                                                    className="btn-secondary px-3 py-1.5 text-xs font-semibold"
                                                >
                                                    Contact Seller
                                                </Link>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default MyOrders;

