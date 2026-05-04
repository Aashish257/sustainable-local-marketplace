import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../services/apiClient';
import { ORDERS, PRODUCTS_MINE } from '../../../services/endpoints';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend
} from 'recharts';

const Analytics = () => {
    const { data: ordersData } = useQuery({
        queryKey: ['my-orders'],
        queryFn: () => apiClient.get(ORDERS.MY).then(r => r.data),
        staleTime: 5 * 60 * 1000,
    });

    const { data: productsData } = useQuery({
        queryKey: ['my-products'],
        queryFn: () => apiClient.get(PRODUCTS_MINE).then(r => r.data),
        staleTime: 5 * 60 * 1000,
    });

    const orders = ordersData?.data || [];
    const products = productsData?.data || [];

    // Group orders by month for chart
    const monthlyData = orders.reduce((acc, order) => {
        const month = new Date(order.createdAt).toLocaleString('default', { month: 'short', year: '2-digit' });
        const existing = acc.find(d => d.month === month);
        const amount = order.status === 'paid' ? order.totalAmount : 0;
        if (existing) {
            existing.revenue += amount;
            existing.orders += 1;
        } else {
            acc.push({ month, revenue: amount, orders: 1 });
        }
        return acc;
    }, []).slice(-6); // last 6 months

    const totalRevenue = orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.totalAmount, 0);
    const paidCount = orders.filter(o => o.status === 'paid').length;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Analytics</h1>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {[
                    { label: 'Total Products', value: products.length, icon: '📦' },
                    { label: 'Total Orders', value: orders.length, icon: '🛒' },
                    { label: 'Paid Orders', value: paidCount, icon: '✅' },
                    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: '💰' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
                        <div className="text-3xl mb-2">{s.icon}</div>
                        <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                        <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-700 mb-6">Monthly Revenue & Orders</h2>
                {monthlyData.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <p>No data to display yet. Start selling to see analytics!</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(val, name) => [name === 'revenue' ? `₹${val}` : val, name === 'revenue' ? 'Revenue' : 'Orders']} />
                            <Legend />
                            <Bar dataKey="revenue" fill="#16a34a" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="orders" fill="#93c5fd" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default Analytics;
