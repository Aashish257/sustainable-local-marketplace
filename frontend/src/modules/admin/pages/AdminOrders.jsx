import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../services/apiClient';
import { ADMIN } from '../../../services/endpoints';
import { SkeletonGrid } from '../../../shared/components/SkeletonLoader';
import StatusBadge from '../../../shared/components/StatusBadge';
import EmptyState from '../../../shared/components/EmptyState';
import toast from 'react-hot-toast';
import { ShoppingCart, Search, Calendar, ShieldCheck, AlertCircle } from 'lucide-react';

const AdminOrders = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const { data, isLoading, isError } = useQuery({
        queryKey: ['admin-orders'],
        queryFn: () => apiClient.get(ADMIN.ORDERS).then(r => r.data)
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ orderId, status }) => 
            apiClient.patch(`/admin/orders/${orderId}/status`, { status }).then(r => r.data),
        onSuccess: () => {
            toast.success('Order transaction state updated successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        },
        onError: (err) => {
            toast.error(err.response?.data?.error || 'Failed to update order status.');
        }
    });

    if (isLoading) return <div className="container mx-auto py-12"><SkeletonGrid count={4} /></div>;
    if (isError) return (
        <div className="glass-card p-8 rounded-3xl border border-rose-500/30 text-rose-500 text-sm font-mono flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            <span>FAILED TO LOAD ORDER STREAM. Verify administrator privileges.</span>
        </div>
    );

    const orders = data?.data || [];

    const filteredOrders = orders.filter(o => {
        const matchesSearch = 
            o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (o.buyerId?.name && o.buyerId.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (o.buyerId?.email && o.buyerId.email.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleStatusChange = (orderId, newStatus) => {
        updateStatusMutation.mutate({ orderId, status: newStatus });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        ALL ORDERS
                    </div>
                    <h1 className="text-3xl font-display font-extrabold text-[var(--text-main)]">All orders</h1>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {orders.length} platform escrow orders across all participating buyers and artisans
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search Order ID or buyer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-amber-500 transition-all w-48 sm:w-60"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-main)] focus:outline-none focus:border-amber-500 font-medium transition-all"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>
            
            {/* Orders Table */}
            {filteredOrders.length === 0 ? (
                <EmptyState
                    title="No order records found"
                    message={searchTerm ? "No transactions match your search filter." : "No orders have been recorded in the platform ledger yet."}
                />
            ) : (
                <div className="glass-card rounded-3xl border border-[var(--border-card)] overflow-hidden shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-black/[0.02] dark:bg-white/[0.02] text-[var(--text-muted)] border-b border-[var(--border-card)] font-bold uppercase tracking-wider text-xs">
                                <tr>
                                    <th className="px-6 py-4">PAYLOAD ID</th>
                                    <th className="px-6 py-4">BUYER CLAIM</th>
                                    <th className="px-6 py-4">SETTLED AMOUNT</th>
                                    <th className="px-6 py-4">TRANSACTION STATE</th>
                                    <th className="px-6 py-4 hidden md:table-cell">TIMESTAMP</th>
                                    <th className="px-6 py-4 text-right">OVERRIDE TRANSITION</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-card)] font-medium">
                                {filteredOrders.map(o => (
                                    <tr key={o._id} className="hover:bg-black/[0.015] dark:hover:bg-white/[0.015] transition-colors">
                                        <td className="px-6 py-4 font-mono font-bold text-[var(--text-main)]">
                                            #{o._id.slice(-8).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {o.buyerId ? (
                                                <div>
                                                    <p className="font-bold text-[var(--text-main)]">{o.buyerId.name}</p>
                                                    <p className="text-xs text-[var(--text-muted)]">{o.buyerId.email}</p>
                                                </div>
                                            ) : (
                                                <span className="text-[var(--text-muted)] italic">Anonymous Buyer</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">
                                            ₹{o.totalAmount?.toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={o.status} />
                                        </td>
                                        <td className="px-6 py-4 text-[var(--text-muted)] text-xs hidden md:table-cell">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <select
                                                value={o.status}
                                                onChange={(e) => handleStatusChange(o._id, e.target.value)}
                                                disabled={updateStatusMutation.isPending}
                                                className="px-3 py-1.5 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-main)] focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="paid">Paid</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
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

export default AdminOrders;

