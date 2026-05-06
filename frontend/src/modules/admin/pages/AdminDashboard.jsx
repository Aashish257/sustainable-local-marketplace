import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../services/apiClient';
import { ADMIN } from '../../../services/endpoints';
import { SkeletonGrid } from '../../../shared/components/SkeletonLoader';

const AdminDashboard = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: () => apiClient.get(ADMIN.STATS).then(r => r.data)
    });

    if (isLoading) return <SkeletonGrid count={4} />;
    if (isError) return <div className="text-red-500">Failed to load system stats.</div>;

    const stats = data?.data;

    const statCards = [
        { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'bg-blue-50 text-blue-700' },
        { label: 'Total Products', value: stats.totalProducts, icon: '📦', color: 'bg-green-50 text-green-700' },
        { label: 'Total Orders', value: stats.totalOrders, icon: '🛒', color: 'bg-amber-50 text-amber-700' },
        { label: 'Platform Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: '💰', color: 'bg-purple-50 text-purple-700' }
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-8">System Overview</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, idx) => (
                    <div key={idx} className={`p-6 rounded-2xl shadow-sm border border-slate-100 ${card.color} flex items-center gap-4`}>
                        <div className="text-4xl">{card.icon}</div>
                        <div>
                            <p className="text-sm font-bold opacity-80 uppercase tracking-wider mb-1">{card.label}</p>
                            <p className="text-3xl font-black">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-12 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Admin Controls</h2>
                <p className="text-slate-500">Use the sidebar to view detailed lists of users, products, and orders across the entire sustainable marketplace platform.</p>
            </div>
        </div>
    );
};

export default AdminDashboard;
