import { useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../services/apiClient';
import { PRODUCTS_MINE } from '../../../services/endpoints';
import { useDeleteProduct } from '../../product/services/productQueries';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import EmptyState from '../../../shared/components/EmptyState';

const SellerProducts = () => {
    const queryClient = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ['my-products'],
        queryFn: () => apiClient.get(PRODUCTS_MINE).then(r => r.data),
        staleTime: 5 * 60 * 1000,
    });

    const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

    const handleDelete = (id, title) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
        deleteProduct(id, {
            onSuccess: () => {
                toast.success('Product deleted successfully');
                queryClient.invalidateQueries({ queryKey: ['my-products'] });
            },
            onError: () => toast.error('Failed to delete product')
        });
    };

    const products = data?.data || [];

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-mono text-xs uppercase tracking-wider mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        CATALOG MANAGEMENT
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black font-display text-[var(--text-main)]">Active Products</h1>
                </div>
                <Link 
                    to="/dashboard/products/add" 
                    className="btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-2"
                >
                    <span>+</span> Add New Product
                </Link>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-16 glass-card animate-pulse" />)}
                </div>
            ) : products.length === 0 ? (
                <EmptyState
                    title="No products listed yet"
                    description="Publish your first verified artisan item to make it discoverable to conscious local buyers."
                    actionLabel="Add Your First Product"
                    actionLink="/dashboard/products/add"
                />
            ) : (
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-black/[0.02] dark:bg-white/[0.02] text-[var(--text-muted)] border-b border-[var(--border-card)] uppercase tracking-wider text-[10px] font-mono font-bold">
                                <tr>
                                    <th className="px-6 py-3.5">Product</th>
                                    <th className="px-6 py-3.5 hidden md:table-cell">Category</th>
                                    <th className="px-6 py-3.5">Price</th>
                                    <th className="px-6 py-3.5 hidden md:table-cell">Stock Status</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-card)] font-medium">
                                {products.map(p => (
                                    <tr key={p._id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-[var(--border-card)] flex-shrink-0">
                                                    {p.images?.[0] ? (
                                                        <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs">🌿</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[var(--text-main)] text-xs">{p.title}</p>
                                                    {!p.isApproved && (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-semibold">Pending approval</span>
                                                    )}
                                                    {p.biddingEnabled && (
                                                        <span className="inline-block mt-0.5 text-[9px] font-mono font-bold uppercase text-amber-600 dark:text-amber-400">
                                                            ⚡ Live Auction
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[var(--text-muted)] hidden md:table-cell">
                                            <span className="glass px-2.5 py-1 rounded-full text-[10px]">
                                                {p.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold font-mono text-emerald-600 dark:text-emerald-400">
                                            ₹{p.price?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            {p.stock <= 0 ? (
                                                <span className="text-rose-500 font-bold text-[10px] font-mono uppercase">Out of Stock</span>
                                            ) : (
                                                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px]">
                                                    {p.stock} units
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 text-[10px]">
                                                <Link
                                                    to={`/products/${p._id}`}
                                                    className="btn-secondary px-2.5 py-1 text-[10px] font-semibold"
                                                >
                                                    View
                                                </Link>
                                                <Link
                                                    to={`/dashboard/products/edit/${p._id}`}
                                                    className="btn-secondary px-2.5 py-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(p._id, p.title)}
                                                    disabled={isDeleting}
                                                    className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 hover:bg-rose-500/20 transition-all font-semibold cursor-pointer disabled:opacity-40"
                                                >
                                                    Delete
                                                </button>
                                            </div>
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

export default SellerProducts;

