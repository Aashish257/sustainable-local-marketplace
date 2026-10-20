import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import apiClient from '../../../services/apiClient';
import { ADMIN } from '../../../services/endpoints';
import { SkeletonGrid } from '../../../shared/components/SkeletonLoader';
import EmptyState from '../../../shared/components/EmptyState';
import toast from 'react-hot-toast';
import { Package, ExternalLink, Trash2, Search, Tag, AlertTriangle, ShieldCheck } from 'lucide-react';

const AdminProducts = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const { data, isLoading, isError } = useQuery({
        queryKey: ['admin-products'],
        queryFn: () => apiClient.get(ADMIN.PRODUCTS).then(r => r.data)
    });

    const deleteProductMutation = useMutation({
        mutationFn: (id) => 
            apiClient.delete(`/admin/products/${id}`).then(r => r.data),
        onSuccess: () => {
            toast.success('Catalog product purged by admin');
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        },
        onError: (err) => {
            toast.error(err.response?.data?.error || 'Failed to purge catalog product.');
        }
    });

    // Approve (true) or reject/unpublish (false) a listing
    const approvalMutation = useMutation({
        mutationFn: ({ id, approved }) =>
            apiClient.patch(`/admin/products/${id}/approval`, { approved }).then(r => r.data),
        onSuccess: (_, { approved }) => {
            toast.success(approved ? 'Product approved and live in catalog' : 'Product hidden from catalog');
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        },
        onError: (err) => toast.error(err.response?.data?.error || 'Failed to update approval.')
    });

    if (isLoading) return <div className="container mx-auto py-12"><SkeletonGrid count={4} /></div>;
    if (isError) return (
        <div className="glass-card p-8 rounded-3xl border border-rose-500/30 text-rose-500 text-sm font-mono flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <span>FAILED TO LOAD CATALOG NODES. Verify admin privileges.</span>
        </div>
    );

    const products = data?.data || [];

    const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];

    const filteredProducts = products.filter(p => {
        const matchesSearch = 
            (p.title && p.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (p.sellerId?.name && p.sellerId.name.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
        const matchesStatus = statusFilter === 'all' || (statusFilter === 'pending' ? !p.isApproved : p.isApproved);
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const handleDelete = (id, title) => {
        if (!window.confirm(`Are you sure you want to purge catalog product "${title}"?`)) return;
        deleteProductMutation.mutate(id);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-1">
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                        CATALOG GOVERNANCE MESH
                    </div>
                    <h1 className="text-3xl font-display font-extrabold text-[var(--text-main)]">Catalog Governance</h1>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {products.length} registered ecological goods and verified artisan listings
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search title or artisan..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-teal-500 transition-all w-48 sm:w-60"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        aria-label="Filter by approval status"
                        className="px-3 py-2 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-main)] focus:outline-none focus:border-teal-500 font-medium transition-all"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending Approval</option>
                        <option value="approved">Approved</option>
                    </select>
                    {categories.length > 1 && (
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-3 py-2 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-main)] focus:outline-none focus:border-teal-500 font-medium transition-all"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat === 'all' ? 'All Categories' : cat}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            </div>
            
            {/* Products Table */}
            {filteredProducts.length === 0 ? (
                <EmptyState
                    title="No catalog nodes found"
                    message={searchTerm ? "No products match your search query." : "No catalog products have been registered yet."}
                />
            ) : (
                <div className="glass-card rounded-3xl border border-[var(--border-card)] overflow-hidden shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-black/[0.02] dark:bg-white/[0.02] text-[var(--text-muted)] border-b border-[var(--border-card)] font-bold uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th className="px-6 py-4">PRODUCT NODE</th>
                                    <th className="px-6 py-4">PRODUCER / ORIGIN</th>
                                    <th className="px-6 py-4">SETTLEMENT</th>
                                    <th className="px-6 py-4 hidden md:table-cell">INVENTORY</th>
                                    <th className="px-6 py-4">STATUS</th>
                                    <th className="px-6 py-4 text-right">ADMIN CONTROL</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-card)] font-medium">
                                {filteredProducts.map(p => {
                                    const image = p.images?.[0] || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=200&auto=format&fit=crop&q=60';
                                    return (
                                        <tr key={p._id} className="hover:bg-black/[0.015] dark:hover:bg-white/[0.015] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img 
                                                        src={image} 
                                                        alt={p.title}
                                                        className="w-11 h-11 rounded-2xl object-cover border border-[var(--border-card)] flex-shrink-0" 
                                                    />
                                                    <div>
                                                        <p className="font-bold text-[var(--text-main)] text-sm line-clamp-1">{p.title}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                                                                {p.category || 'General'}
                                                            </span>
                                                            {p.isAuction && (
                                                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-semibold">
                                                                    Auction
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {p.sellerId ? (
                                                    <div>
                                                        <p className="font-bold text-[var(--text-main)]">{p.sellerId.name}</p>
                                                        <p className="text-[10px] text-[var(--text-muted)]">{p.sellerId.email}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-[var(--text-muted)] italic">Unknown Producer</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                                                ₹{p.price?.toLocaleString('en-IN')}
                                            </td>
                                            <td className="px-6 py-4 text-[var(--text-muted)] hidden md:table-cell">
                                                <span className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold ${
                                                    p.stock > 10 ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' :
                                                    p.stock > 0 ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10' :
                                                    'text-rose-600 dark:text-rose-400 bg-rose-500/10'
                                                }`}>
                                                    {p.stock} units
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold ${p.isApproved ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' : 'text-amber-600 dark:text-amber-400 bg-amber-500/10'}`}>
                                                    {p.isApproved ? 'Approved' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => approvalMutation.mutate({ id: p._id, approved: !p.isApproved })}
                                                        disabled={approvalMutation.isPending}
                                                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border border-transparent transition-all cursor-pointer disabled:opacity-40 ${p.isApproved ? 'text-amber-600 hover:bg-amber-500/10' : 'text-emerald-600 hover:bg-emerald-500/10'}`}
                                                        title={p.isApproved ? 'Hide from catalog' : 'Approve listing'}
                                                    >
                                                        <ShieldCheck className="w-3.5 h-3.5" />
                                                        <span>{p.isApproved ? 'Reject' : 'Approve'}</span>
                                                    </button>
                                                    <Link 
                                                        to={`/products/${p._id}`} 
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] text-[var(--text-main)] transition-all"
                                                        title="Audit live catalog listing"
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                        <span>Audit</span>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(p._id, p.title)}
                                                        disabled={deleteProductMutation.isPending}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer disabled:opacity-40"
                                                        title="Purge product from catalog"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        <span>Purge</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;

