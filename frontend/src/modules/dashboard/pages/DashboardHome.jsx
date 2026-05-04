import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../services/apiClient';
import { PRODUCTS_MINE, ORDERS } from '../../../services/endpoints';
import useAuthStore from '../../../store/authStore';

const StatCard = ({ label, value, icon, color }) => (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const DashboardHome = () => {
    const user = useAuthStore((s) => s.user);

    const { data: productsData } = useQuery({
        queryKey: ['my-products'],
        queryFn: () => apiClient.get(PRODUCTS_MINE).then(r => r.data),
        staleTime: 5 * 60 * 1000,
    });

    const { data: ordersData } = useQuery({
        queryKey: ['seller-orders'],
        queryFn: () => apiClient.get(ORDERS.SELLER).then(r => r.data),
        staleTime: 5 * 60 * 1000,
    });

    const products = productsData?.data || [];
    const orders = ordersData?.data || [];
    const paidOrders = orders.filter(o => o.status === 'paid');
    const revenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user?.name}! 👋</h1>
                <p className="text-gray-400 mt-1">Here's what's happening with your store today.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard label="Total Products" value={products.length} icon="📦" color="bg-blue-50" />
                <StatCard label="Total Orders" value={orders.length} icon="🛒" color="bg-amber-50" />
                <StatCard label="Revenue (Paid)" value={`₹${revenue.toLocaleString()}`} icon="💰" color="bg-green-50" />
            </div>
        </div>
    );
};

export default DashboardHome;
