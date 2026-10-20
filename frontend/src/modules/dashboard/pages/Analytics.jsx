import { Package, Truck, CircleCheck, Sprout } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../services/apiClient';
import { ORDERS, PRODUCTS_MINE } from '../../../services/endpoints';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend
} from 'recharts';

const Analytics = () => {
    const { data: ordersData } = useQuery({
        queryKey: ['seller-orders'],
        queryFn: () => apiClient.get(ORDERS.SELLER).then(r => r.data),
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
        const amount = order.status === 'paid' ? (order.totalAmount || 0) : 0;
        if (existing) {
            existing.revenue += amount;
            existing.orders += 1;
        } else {
            acc.push({ month, revenue: amount, orders: 1 });
        }
        return acc;
    }, []).slice(-6); // last 6 months

    const totalRevenue = orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const paidCount = orders.filter(o => o.status === 'paid').length;

    const stats = [
        { 
            label: 'Catalog Items', 
            value: products.length, 
            icon: <Package className="w-4 h-4" aria-hidden="true" />,
        },
        { 
            label: 'Total Orders', 
            value: orders.length, 
            icon: <Truck className="w-4 h-4" aria-hidden="true" />,
        },
        { 
            label: 'Settled Sales', 
            value: paidCount, 
            icon: <CircleCheck className="w-4 h-4" aria-hidden="true" />,
        },
        { 
            label: 'Audited Revenue', 
            value: `₹${totalRevenue.toLocaleString()}`, 
            icon: <Sprout className="w-4 h-4" aria-hidden="true" />,
        },
    ];

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div>
                <div className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-mono text-xs uppercase tracking-wider mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    ANALYTICS &amp; IMPACT
                </div>
                <h1 className="text-2xl sm:text-3xl font-black font-display text-[var(--text-main)]">Performance Telemetry</h1>
                <p className="text-xs text-[var(--text-muted)] mt-1 font-sans">Historical monthly order frequency and capital velocity.</p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(s => (
                    <div key={s.label} className="glass-card p-5">
                        <div className="flex items-center justify-between text-[var(--text-muted)] text-xs mb-2">
                            <span>{s.label}</span>
                            <span className="text-base">{s.icon}</span>
                        </div>
                        <div className="text-2xl font-bold font-display text-[var(--text-main)] tracking-tight">{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Revenue Chart */}
            <div className="glass-card p-6 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[var(--border-card)]">
                    <div>
                        <h2 className="text-base font-bold text-[var(--text-main)] font-display">Monthly Revenue &amp; Dispatch Volume</h2>
                        <p className="text-xs text-[var(--text-muted)] font-sans mt-0.5">Aggregated performance across 30-day fulfillment cycles</p>
                    </div>
                </div>
                {monthlyData.length === 0 ? (
                    <div className="text-center py-16 text-[var(--text-muted)] text-xs">
                        <p>No historical transactions recorded yet to render monthly analytics.</p>
                    </div>
                ) : (
                    <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(150, 150, 150, 0.15)" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'currentColor' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: 'currentColor' }} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'var(--bg-card)', 
                                        borderRadius: '16px', 
                                        border: '1px solid var(--border-card)', 
                                        color: 'var(--text-main)',
                                        fontSize: '12px',
                                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)'
                                    }} 
                                    formatter={(val, name) => [name === 'revenue' ? `₹${val.toLocaleString()}` : val, name === 'revenue' ? 'Settled Revenue' : 'Order Count']} 
                                />
                                <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--text-muted)' }} />
                                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="orders" fill="#0284c7" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;

