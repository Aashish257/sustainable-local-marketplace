import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../services/apiClient';
import { ORDERS } from '../../../services/endpoints';
import toast from 'react-hot-toast';
import StatusBadge from '../../../shared/components/StatusBadge';
import EmptyState from '../../../shared/components/EmptyState';

// Mirrors the backend order state machine (order.service.js TRANSITIONS)
const NEXT_STATUS = { pending: ['cancelled'], paid: ['shipped', 'cancelled'], shipped: ['delivered'] };
const STATUS_LABEL = { pending: 'Pending', paid: 'Paid & Processing', shipped: 'Dispatched', delivered: 'Delivered', cancelled: 'Cancelled' };

const SellerOrders = () => {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['seller-orders'],
        queryFn: () => apiClient.get(ORDERS.SELLER).then(r => r.data),
        staleTime: 5 * 60 * 1000,
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ orderId, status }) => 
            apiClient.patch(`/orders/${orderId}/status`, { status }).then(r => r.data),
        onSuccess: () => {
            toast.success('Order status updated successfully');
            queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
        },
        onError: (err) => {
            toast.error(err.response?.data?.error || 'Failed to update order status');
        }
    });

    const handleStatusChange = (orderId, newStatus) => {
        updateStatusMutation.mutate({ orderId, status: newStatus });
    };

    const orders = data?.data || [];

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div>
                <div className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-mono text-xs uppercase tracking-wider mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    DISPATCH &amp; FULFILLMENT
                </div>
                <h1 className="text-2xl sm:text-3xl font-black font-display text-[var(--text-main)]">Inbound Orders</h1>
                <p className="text-xs text-[var(--text-muted)] mt-1 font-sans">
                    Track incoming purchases, review items, and update fulfillment milestones.
                </p>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-16 glass-card animate-pulse" />)}
                </div>
            ) : orders.length === 0 ? (
                <EmptyState
                    title="No inbound orders yet"
                    description="When buyers purchase your catalog items or win live auctions, orders will appear here for fulfillment."
                />
            ) : (
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-black/[0.02] dark:bg-white/[0.02] text-[var(--text-muted)] border-b border-[var(--border-card)] uppercase tracking-wider text-xs font-mono font-bold">
                                <tr>
                                    <th className="px-6 py-3.5">Order ID</th>
                                    <th className="px-6 py-3.5 hidden md:table-cell">Items</th>
                                    <th className="px-6 py-3.5">Total Amount</th>
                                    <th className="px-6 py-3.5">Current Status</th>
                                    <th className="px-6 py-3.5 hidden md:table-cell">Date</th>
                                    <th className="px-6 py-3.5 text-right">Update Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-card)] font-medium">
                                {orders.map(o => (
                                    <tr key={o._id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 font-bold font-mono text-[var(--text-main)]">
                                            #{o._id.slice(-8).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4 text-[var(--text-muted)] hidden md:table-cell">
                                            {o.items?.length || 0} item(s)
                                        </td>
                                        <td className="px-6 py-4 font-bold font-mono text-emerald-600 dark:text-emerald-400">
                                            ₹{o.totalAmount?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={o.status} />
                                        </td>
                                        <td className="px-6 py-4 text-[var(--text-muted)] text-xs hidden md:table-cell">
                                            {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {o.status !== 'delivered' && o.status !== 'cancelled' ? (
                                                <select
                                                    value={o.status}
                                                    onChange={(e) => handleStatusChange(o._id, e.target.value)}
                                                    disabled={updateStatusMutation.isPending}
                                                    className="bg-[var(--bg-page)] border border-[var(--border-card)] text-xs font-semibold text-[var(--text-main)] px-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500 transition-all cursor-pointer uppercase"
                                                >
                                                    {/* Current status + only the moves the API allows */}
                                                    {[o.status, ...(NEXT_STATUS[o.status] || [])].map((s) => (
                                                        <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span className="text-xs text-[var(--text-muted)] font-mono font-bold uppercase">Finalized</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerOrders;

