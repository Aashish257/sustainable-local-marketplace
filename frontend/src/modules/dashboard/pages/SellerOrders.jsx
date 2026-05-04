import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../services/apiClient';
import { ORDERS } from '../../../services/endpoints';

const statusColors = {
    pending: 'bg-amber-100 text-amber-700',
    paid: 'bg-green-100 text-green-700',
    shipped: 'bg-blue-100 text-blue-700',
    delivered: 'bg-purple-100 text-purple-700',
};

const SellerOrders = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['seller-orders'],
        queryFn: () => apiClient.get(ORDERS.SELLER).then(r => r.data),
        staleTime: 5 * 60 * 1000,
    });

    const orders = data?.data || [];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Orders</h1>

            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl">
                    <p className="text-gray-400 text-lg">No orders yet.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left px-6 py-4 text-gray-500 font-medium">Order ID</th>
                                <th className="text-left px-6 py-4 text-gray-500 font-medium hidden md:table-cell">Items</th>
                                <th className="text-left px-6 py-4 text-gray-500 font-medium">Total</th>
                                <th className="text-left px-6 py-4 text-gray-500 font-medium">Status</th>
                                <th className="text-left px-6 py-4 text-gray-500 font-medium hidden md:table-cell">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {orders.map(o => (
                                <tr key={o._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{o._id.slice(-8)}</td>
                                    <td className="px-6 py-4 text-gray-600 hidden md:table-cell">
                                        {o.items?.length || 0} item(s)
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-800">₹{o.totalAmount?.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[o.status] || 'bg-gray-100 text-gray-600'}`}>
                                            {o.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 text-xs hidden md:table-cell">
                                        {new Date(o.createdAt).toLocaleDateString()}
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

export default SellerOrders;
