import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../services/apiClient';
import { ADMIN } from '../../../services/endpoints';
import { SkeletonGrid } from '../../../shared/components/SkeletonLoader';
import { Link } from 'react-router-dom';

const AdminProducts = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['admin-products'],
        queryFn: () => apiClient.get(ADMIN.PRODUCTS).then(r => r.data)
    });

    if (isLoading) return <SkeletonGrid count={4} />;
    if (isError) return <div className="text-red-500">Failed to load products.</div>;

    const products = data?.data || [];

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-8">All Products</h1>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-medium">
                        <tr>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4">Seller</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4">Stock</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {products.map(p => (
                            <tr key={p._id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-bold text-slate-800 line-clamp-1">{p.title}</td>
                                <td className="px-6 py-4 text-slate-600">
                                    {p.sellerId ? (
                                        <div>
                                            <p>{p.sellerId.name}</p>
                                            <p className="text-xs text-slate-400">{p.sellerId.email}</p>
                                        </div>
                                    ) : (
                                        <span className="text-slate-400">Unknown</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 font-bold text-green-700">₹{p.price}</td>
                                <td className="px-6 py-4 text-slate-600">{p.stock}</td>
                                <td className="px-6 py-4">
                                    <Link to={`/products/${p._id}`} className="text-blue-600 hover:underline">
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminProducts;
