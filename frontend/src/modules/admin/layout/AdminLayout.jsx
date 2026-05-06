import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import useAuthStore from "../../../store/authStore";

const AdminLayout = () => {
    const location = useLocation();
    const { user } = useAuthStore();

    // Extra security: if user somehow reaches here but isn't admin, redirect them
    if (user?.role !== 'admin') {
        return <Navigate to="/products" replace />;
    }

    const navLinks = [
        { path: "/admin", label: "📊 Overview" },
        { path: "/admin/users", label: "👥 Users" },
        { path: "/admin/products", label: "📦 Products" },
        { path: "/admin/orders", label: "🛒 Orders" }
    ];

    return (
        <div className="flex min-h-[calc(100vh-4rem)] bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0">
                <div className="p-6">
                    <h2 className="text-xl font-black text-white tracking-wider uppercase">System Admin</h2>
                    <p className="text-sm text-slate-500 mt-1">Superuser Control Panel</p>
                </div>
                
                <nav className="mt-2 flex flex-col gap-1 px-4">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                                    isActive 
                                    ? "bg-slate-800 text-white shadow-inner" 
                                    : "hover:bg-slate-800/50 hover:text-white"
                                }`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-x-hidden">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
