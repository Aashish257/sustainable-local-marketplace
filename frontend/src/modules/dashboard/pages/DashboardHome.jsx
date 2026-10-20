import { Package, Truck, IndianRupee, ShoppingCart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import apiClient from '../../../services/apiClient';
import { PRODUCTS_MINE, ORDERS } from '../../../services/endpoints';
import useAuthStore from '../../../store/authStore';
import StatusBadge from '../../../shared/components/StatusBadge';

const StatCard = ({ label, value, trend, icon }) => (
    <div className="glass-card p-5 relative overflow-hidden">
        <div className="flex items-center justify-between text-[var(--text-muted)] text-xs mb-2">
            <span className="font-medium">{label}</span>
            <span className="text-base">{icon}</span>
        </div>
        <div className="text-2xl sm:text-3xl font-bold font-display text-[var(--text-main)] tracking-tight">{value}</div>
        {trend && (
            <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1.5 font-medium font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {trend}
            </div>
        )}
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
    // Revenue counts every order that was paid, including ones already shipped or delivered
    const soldOrders = orders.filter(o => ['paid', 'shipped', 'delivered'].includes(o.status));
    const toShip = orders.filter(o => o.status === 'paid'); // the seller's next action
    const revenue = soldOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const avgOrderValue = soldOrders.length > 0 ? revenue / soldOrders.length : 0;

    const recentOrders = orders.slice(0, 5);

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header */}
            <div>
                <div className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-mono text-xs uppercase tracking-wider mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    SELLER STUDIO CONSOLE
                </div>
                <h1 className="text-2xl sm:text-3xl font-black font-display text-[var(--text-main)]">
                    Welcome, {user?.name?.split(' ')[0]}
                </h1>
                <p className="text-xs text-[var(--text-muted)] mt-1 font-sans">
                    Monitor inventory metrics, order dispatches, and circular marketplace earnings.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Products Listed"
                    value={products.length}
                    icon={<Package className="w-4 h-4" aria-hidden="true" />}
                    trend={`${products.filter(p => p.stock > 0).length} in stock`}
                />
                <StatCard
                    label="Total Orders"
                    value={orders.length}
                    icon={<Truck className="w-4 h-4" aria-hidden="true" />}
                    trend={`${toShip.length} to ship`}
                />
                <StatCard
                    label="Revenue"
                    value={`₹${revenue.toLocaleString()}`}
                    icon={<IndianRupee className="w-4 h-4" aria-hidden="true" />}
                    trend={`${soldOrders.length} paid orders`}
                />
                <StatCard
                    label="Average order"
                    value={`₹${Math.round(avgOrderValue).toLocaleString()}`}
                    icon={<ShoppingCart className="w-4 h-4" aria-hidden="true" />}
                    trend="Per paid order"
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { 
                        to: '/dashboard/products/add', 
                        label: 'List New Product', 
                        desc: 'Create an eco-friendly listing with sustainability score', 
                        accent: 'border-emerald-500/30 hover:border-emerald-500'
                    },
                    { 
                        to: '/dashboard/orders', 
                        label: 'Manage Inbound Orders', 
                        desc: `${toShip.length} paid orders waiting to be shipped`, 
                        accent: 'hover:border-emerald-500/50'
                    },
                    { 
                        to: '/dashboard/analytics', 
                        label: 'View Analytics', 
                        desc: 'Inspect sales velocity, offsets, and monthly charts', 
                        accent: 'hover:border-emerald-500/50'
                    },
                ].map(action => (
                    <Link
                        key={action.to}
                        to={action.to}
                        className={`glass-card p-6 transition-all flex flex-col justify-between ${action.accent}`}
                    >
                        <div>
                            <p className="font-bold text-sm text-[var(--text-main)] font-display">{action.label}</p>
                            <p className="text-[var(--text-muted)] text-xs mt-1 font-sans leading-relaxed">{action.desc}</p>
                        </div>
                        <div className="mt-4 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-semibold flex items-center gap-1">
                            OPEN WORKSPACE →
                        </div>
                    </Link>
                ))}
            </div>

            {/* Recent Orders */}
            {recentOrders.length > 0 && (
                <div className="glass-card overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-card)] bg-black/[0.02] dark:bg-white/[0.02]">
                        <h2 className="font-bold text-sm text-[var(--text-main)] font-display">Recent Orders</h2>
                        <Link to="/dashboard/orders" className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                            View All Orders →
                        </Link>
                    </div>
                    <div className="divide-y divide-[var(--border-card)]">
                        {recentOrders.map(order => (
                            <div key={order._id} className="px-6 py-4 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors text-xs">
                                <div>
                                    <p className="font-bold text-[var(--text-main)] font-mono">#{order._id.slice(-8).toUpperCase()}</p>
                                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                    <p className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                                        ₹{order.totalAmount?.toLocaleString()}
                                    </p>
                                    <StatusBadge status={order.status} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardHome;

