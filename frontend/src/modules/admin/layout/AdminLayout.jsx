import { LayoutDashboard, Users, Package, Receipt, Leaf } from "lucide-react";
import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import useAuthStore from "../../../store/authStore";

const AdminLayout = () => {
    const location = useLocation();
    const { user } = useAuthStore();

    if (user?.role !== 'admin') {
        return <Navigate to="/products" replace />;
    }

    const navLinks = [
        { path: "/admin", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" aria-hidden="true" />, exact: true },
        { path: "/admin/users", label: "Users", icon: <Users className="w-4 h-4" aria-hidden="true" /> },
        { path: "/admin/products", label: "Products", icon: <Package className="w-4 h-4" aria-hidden="true" /> },
        { path: "/admin/orders", label: "Orders", icon: <Receipt className="w-4 h-4" aria-hidden="true" /> }
    ];

    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : 'A';

    return (
        <div className="flex min-h-screen bg-[var(--bg-page)] text-[var(--text-main)]">
            {/* ===== SIDEBAR ===== */}
            <aside className="w-64 bg-[var(--bg-card)] border-r border-[var(--border-card)] flex-shrink-0 hidden lg:flex flex-col">
                {/* Brand */}
                <div className="px-6 py-5 border-b border-[var(--border-card)]">
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center font-display font-black text-emerald-600 dark:text-emerald-400 text-sm">
                            <Leaf className="w-4 h-4" aria-hidden="true" />
                        </div>
                        <div>
                            <span className="font-bold text-[var(--text-main)] text-sm tracking-tight font-display">SustainMarket</span>
                            <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-semibold">ADMIN PORTAL</div>
                        </div>
                    </Link>
                </div>

                {/* Admin User */}
                <div className="px-4 py-4 border-b border-[var(--border-card)]">
                    <div className="flex items-center gap-3 glass-card px-3.5 py-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs flex-shrink-0">
                            {initials}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-[var(--text-main)] text-xs truncate">{user?.name}</p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                ADMIN
                            </p>
                        </div>
                    </div>
                </div>

                {/* Nav label */}
                <div className="px-6 pt-5 pb-2">
                    <p className="text-xs font-mono font-bold text-[var(--text-muted)] uppercase tracking-wider">ADMIN</p>
                </div>

                <nav className="px-3 flex-1 space-y-1 text-xs">
                    {navLinks.map((link) => {
                        const isActive = link.exact 
                            ? location.pathname === link.path 
                            : (location.pathname.startsWith(link.path) && link.path !== '/admin') || location.pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${isActive
                                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border-l-4 border-l-emerald-500"
                                    : "text-[var(--text-muted)] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:text-[var(--text-main)]"
                                    }`}
                            >
                                <span>{link.icon}</span>
                                <span>{link.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom */}
                <div className="px-3 py-4 border-t border-[var(--border-card)] space-y-1 text-xs">
                    <Link to="/marketplace" className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all">
                        <span>→</span> Browse Marketplace
                    </Link>
                    <Link to="/" className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all">
                        <span>←</span> Return Home
                    </Link>
                </div>
            </aside>

            {/* ===== MAIN CONTENT ===== */}
            <main className="flex-1 overflow-x-hidden bg-[var(--bg-page)]">
                {/* Mobile header */}
                <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[var(--bg-card)] border-b border-[var(--border-card)] sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                            <Leaf className="w-4 h-4" aria-hidden="true" />
                        </div>
                        <span className="font-bold text-xs text-[var(--text-main)] font-display">ADMIN PORTAL</span>
                    </div>
                    {/* Mobile nav row */}
                    <div className="flex gap-1.5 text-xs">
                        {navLinks.map(link => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link key={link.path} to={link.path} className={`px-2.5 py-1 rounded-lg transition-all ${isActive ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold' : 'text-[var(--text-muted)]'}`}>
                                    {link.icon}
                                </Link>
                            );
                        })}
                    </div>
                </div>
                <div className="p-6 lg:p-10 max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
