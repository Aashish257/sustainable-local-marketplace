import { useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../services/apiClient';
import { PRODUCTS_MINE } from '../../../services/endpoints';
import { useDeleteProduct } from '../../product/services/productQueries';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const SellerProducts = () => {
    const queryClient = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ['my-products'],
        queryFn: () => apiClient.get(PRODUCTS_MINE).then(r => r.data),
        staleTime: 5 * 60 * 1000,
    });

    const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

    const handleDelete = (id, title) => {
        if (!window.confirm(`Delete "${title}"?`)) return;
        deleteProduct(id, {
            onSuccess: () => {
                toast.success('Product deleted!');
                queryClient.invalidateQueries({ queryKey: ['my-products'] });
            },
            onError: () => toast.error('Failed to delete product.')
        });
    };

    const products = data?.data || [];

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-800">My Products</h1>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl">
                    <p className="text-gray-400 text-lg">No products yet. Add your first product!</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left px-6 py-4 text-gray-500 font-medium">Product</th>
                                <th className="text-left px-6 py-4 text-gray-500 font-medium hidden md:table-cell">Category</th>
                                <th className="text-left px-6 py-4 text-gray-500 font-medium">Price</th>
                                <th className="text-left px-6 py-4 text-gray-500 font-medium hidden md:table-cell">Stock</th>
                                <th className="text-right px-6 py-4 text-gray-500 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {products.map(p => (
                                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-800">{p.title}</td>
                                    <td className="px-6 py-4 text-gray-500 hidden md:table-cell">{p.category}</td>
                                    <td className="px-6 py-4 font-bold text-green-600">₹{p.price}</td>
                                    <td className="px-6 py-4 text-gray-500 hidden md:table-cell">{p.stock}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                to={`/products/${p._id}`}
                                                className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                                            >
                                                View
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(p._id, p.title)}
                                                disabled={isDeleting}
                                                className="text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors disabled:opacity-40"
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
            )}
        </div>
    );
};

export default SellerProducts;
