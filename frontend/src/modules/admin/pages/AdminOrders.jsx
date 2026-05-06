import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../services/apiClient';
import { ADMIN } from '../../../services/endpoints';
import { SkeletonGrid } from '../../../shared/components/SkeletonLoader';

const statusColors = {
    pending: 'bg-amber-100 text-amber-700',
    paid: 'bg-green-100 text-green-700',
    shipped: 'bg-blue-100 text-blue-700',
    delivered: 'bg-purple-100 text-purple-700',
    cancelled: 'bg-red-100 text-red-700'
};

const AdminOrders = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['admin-orders'],
        queryFn: () => apiClient.get(ADMIN.ORDERS).then(r => r.data)
    });

    if (isLoading) return <SkeletonGrid count={4} />;
    if (isError) return <div className="text-red-500">Failed to load orders.</div>;

    const orders = data?.data || [];

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-8">All Orders</h1>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-medium">
                        <tr>
                            <th className="px-6 py-4">Order ID</th>
                            <th className="px-6 py-4">Buyer</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {orders.map(o => (
                            <tr key={o._id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-mono text-xs text-slate-500">{o._id.slice(-8)}</td>
                                <td className="px-6 py-4 text-slate-600">
                                    {o.buyerId ? (
                                        <div>
                                            <p className="font-bold text-slate-800">{o.buyerId.name}</p>
                                            <p className="text-xs text-slate-400">{o.buyerId.email}</p>
                                        </div>
                                    ) : (
                                        <span className="text-slate-400">Unknown</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 font-bold text-slate-800">₹{o.totalAmount?.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[o.status] || 'bg-slate-100 text-slate-600'}`}>
                                        {o.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500 text-xs">
                                    {new Date(o.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrders;
