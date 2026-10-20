import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import apiClient from '../../../services/apiClient';
import { ADMIN } from '../../../services/endpoints';
import { SkeletonGrid } from '../../../shared/components/SkeletonLoader';
import { Shield, Users, Package, ShoppingCart, IndianRupee, ArrowRight, Activity, Lock } from 'lucide-react';

const AdminDashboard = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: () => apiClient.get(ADMIN.STATS).then(r => r.data)
    });

    if (isLoading) return <div className="container mx-auto py-12"><SkeletonGrid count={4} /></div>;
    if (isError) return (
        <div className="glass-card p-8 rounded-3xl border border-rose-500/30 text-rose-500 text-sm font-mono flex items-center gap-3">
            <Shield className="w-5 h-5 text-rose-500" />
            <span>FAILED TO RETRIEVE ROOT SYSTEM STATS. Verify administrator permissions.</span>
        </div>
    );

    const stats = data?.data || { totalUsers: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0 };

    const statCards = [
        { 
            label: 'Total Registered Users', 
            value: stats.totalUsers, 
            code: 'SYSTEM // 01',
            icon: Users,
            color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
            href: '/admin/users'
        },
        { 
            label: 'Catalog Product Nodes', 
            value: stats.totalProducts, 
            code: 'SYSTEM // 02',
            icon: Package,
            color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
            href: '/admin/products'
        },
        { 
            label: 'Platform Orders Processed', 
            value: stats.totalOrders, 
            code: 'SYSTEM // 03',
            icon: ShoppingCart,
            color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
            href: '/admin/orders'
        },
        { 
            label: 'Total sales', 
            value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, 
            code: 'SYSTEM // 04',
            icon: IndianRupee,
            color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
            href: '/admin/orders'
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase mb-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    PLATFORM OVERVIEW
                </div>
                <h1 className="text-3xl font-display font-extrabold text-[var(--text-main)]">System Infrastructure Overview</h1>
                <p className="text-[var(--text-muted)] text-sm mt-1">
                    Centralized platform administration, identity verification, catalog audits, and financial telemetry.
                </p>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {statCards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div 
                            key={idx} 
                            className="glass-card p-6 rounded-3xl border border-[var(--border-card)] shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${card.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-mono text-[var(--text-muted)] font-semibold tracking-wider">
                                    {card.code}
                                </span>
                            </div>
                            <div className="text-3xl font-display font-black text-[var(--text-main)] tracking-tight">
                                {card.value}
                            </div>
                            <div className="text-xs font-medium text-[var(--text-muted)] mt-1.5 flex items-center justify-between">
                                <span>{card.label}</span>
                                <Link 
                                    to={card.href}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold text-xs"
                                >
                                    Manage <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {/* Quick Actions & Governance Directives */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Link
                    to="/admin/users"
                    className="glass-card p-6 rounded-3xl border border-[var(--border-card)] hover:border-emerald-500/40 transition-all duration-300 group flex flex-col justify-between"
                >
                    <div className="space-y-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                            <Users className="w-5 h-5" />
                        </div>
                        <h3 className="font-display font-bold text-base text-[var(--text-main)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            Users
                        </h3>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                            Review accounts, change roles, and suspend or remove users.
                        </p>
                    </div>
                    <div className="pt-4 mt-4 border-t border-[var(--border-card)] flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <span>Review Accounts</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>

                <Link
                    to="/admin/products"
                    className="glass-card p-6 rounded-3xl border border-[var(--border-card)] hover:border-teal-500/40 transition-all duration-300 group flex flex-col justify-between"
                >
                    <div className="space-y-3">
                        <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20">
                            <Package className="w-5 h-5" />
                        </div>
                        <h3 className="font-display font-bold text-base text-[var(--text-main)] group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                            Products
                        </h3>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                            Approve new listings, check sustainability claims, and remove listings that break the rules.
                        </p>
                    </div>
                    <div className="pt-4 mt-4 border-t border-[var(--border-card)] flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400">
                        <span>Audit Catalog</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>

                <Link
                    to="/admin/orders"
                    className="glass-card p-6 rounded-3xl border border-[var(--border-card)] hover:border-amber-500/40 transition-all duration-300 group flex flex-col justify-between"
                >
                    <div className="space-y-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                            <ShoppingCart className="w-5 h-5" />
                        </div>
                        <h3 className="font-display font-bold text-base text-[var(--text-main)] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            Orders
                        </h3>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                            Inspect end-to-end transactional settlements, review delivery states, and apply administrative status overrides when necessary.
                        </p>
                    </div>
                    <div className="pt-4 mt-4 border-t border-[var(--border-card)] flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
                        <span>Inspect Ledger</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>
            </div>
            
            {/* System Security Notice */}
            <div className="glass-card p-6 rounded-3xl border border-[var(--border-card)] flex items-start gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 flex-shrink-0">
                    <Lock className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-sm font-display font-bold text-[var(--text-main)] tracking-wide">
                        ADMIN NOTE
                    </h2>
                    <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                        Role changes, deletions and order status changes made here take effect immediately for all users.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

