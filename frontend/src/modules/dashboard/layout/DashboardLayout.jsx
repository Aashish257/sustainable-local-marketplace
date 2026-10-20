import { LayoutDashboard, Package, Truck, BarChart3, Leaf } from 'lucide-react';
import { NavLink, Outlet, Navigate, Link } from 'react-router-dom';
import useAuthStore from '../../../store/authStore';

const navItems = [
    { to: '/dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" aria-hidden="true" />, end: true },
    { to: '/dashboard/products', label: 'Products & Catalog', icon: <Package className="w-4 h-4" aria-hidden="true" /> },
    { to: '/dashboard/orders', label: 'Orders & Fulfillment', icon: <Truck className="w-4 h-4" aria-hidden="true" /> },
    { to: '/dashboard/analytics', label: 'Analytics & Impact', icon: <BarChart3 className="w-4 h-4" aria-hidden="true" /> },
];

const DashboardLayout = () => {
    const user = useAuthStore((s) => s.user);

    if (user?.role !== 'seller') {
        return <Navigate to="/products" replace />;
    }

    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : 'S';

    return (
        <div className="flex min-h-screen bg-[var(--bg-page)] text-[var(--text-main)]">
            {/* ===== SIDEBAR ===== */}
            <aside className="w-64 bg-[var(--bg-card)] border-r border-[var(--border-card)] hidden lg:flex flex-col flex-shrink-0">
                {/* Brand */}
                <div className="px-6 py-5 border-b border-[var(--border-card)]">
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center font-display font-black text-emerald-600 dark:text-emerald-400 text-sm">
                            <Leaf className="w-4 h-4" aria-hidden="true" />
                        </div>
                        <div>
                            <span className="font-bold text-[var(--text-main)] text-sm tracking-tight font-display">SustainMarket</span>
                            <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-semibold">SELLER STUDIO</div>
                        </div>
                    </Link>
                </div>

                {/* User Profile */}
                <div className="px-4 py-4 border-b border-[var(--border-card)]">
                    <div className="flex items-center gap-3 glass-card px-3.5 py-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center font-display font-bold text-emerald-600 dark:text-emerald-400 text-xs flex-shrink-0">
                            {initials}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-[var(--text-main)] text-xs truncate">{user?.name}</p>
                            <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                VERIFIED PRODUCER
                            </p>
                        </div>
                    </div>
                </div>

                {/* Nav Label */}
                <div className="px-6 pt-5 pb-2">
                    <p className="text-xs font-mono font-bold text-[var(--text-muted)] uppercase tracking-wider">WORKSPACE</p>
                </div>

                {/* Nav Items */}
                <nav className="px-3 flex-1 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                `flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all
                                ${isActive
                                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border-l-4 border-l-emerald-500'
                                    : 'text-[var(--text-muted)] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:text-[var(--text-main)]'}`
                            }
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="px-3 py-4 border-t border-[var(--border-card)] space-y-1 text-xs">
                    <Link to="/marketplace" className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all">
                        <span>→</span> View Marketplace
                    </Link>
                    <Link to="/" className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all">
                        <span>←</span> Return Home
                    </Link>
                </div>
            </aside>

            {/* ===== MOBILE BOTTOM NAV ===== */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-card)] border-t border-[var(--border-card)] flex z-40">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                            `flex-1 flex flex-col items-center py-2.5 text-center transition-all text-xs
                            ${isActive ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-[var(--text-muted)]'}`
                        }
                    >
                        <span className="text-sm">{item.icon}</span>
                        <span className="mt-0.5">{item.label.split(' & ')[0]}</span>
                    </NavLink>
                ))}
            </div>

            {/* ===== MAIN CONTENT ===== */}
            <main className="flex-1 overflow-y-auto pb-20 lg:pb-0 bg-[var(--bg-page)]">
                {/* Top bar for mobile */}
                <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[var(--bg-card)] border-b border-[var(--border-card)] sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                            <Leaf className="w-4 h-4" aria-hidden="true" />
                        </div>
                        <span className="font-bold text-xs font-display text-[var(--text-main)]">SELLER STUDIO</span>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                        {initials}
                    </div>
                </div>

                <div className="p-6 lg:p-10 max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;

