import { NavLink, Outlet, Navigate } from 'react-router-dom';
import useAuthStore from '../../../store/authStore';

const navItems = [
    { to: '/dashboard', label: '📊 Overview', end: true },
    { to: '/dashboard/products', label: '📦 My Products' },
    { to: '/dashboard/orders', label: '🛒 Orders' },
    { to: '/dashboard/analytics', label: '📈 Analytics' },
];

const DashboardLayout = () => {
    const user = useAuthStore((s) => s.user);

    // RBAC guard: only sellers
    if (user?.role !== 'seller') {
        return <Navigate to="/products" replace />;
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-100 shadow-sm hidden lg:flex flex-col py-8 px-4 gap-1">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-3">Seller Dashboard</h2>
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                            ${isActive ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
                        }
                    >
                        {item.label}
                    </NavLink>
                ))}
            </aside>

            {/* Mobile nav */}
            <div className="lg:hidden w-full fixed bottom-0 bg-white border-t border-gray-100 flex z-40">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                            `flex-1 py-3 text-center text-xs font-medium transition-all
                            ${isActive ? 'text-green-600' : 'text-gray-400'}`
                        }
                    >
                        {item.label.split(' ')[0]}
                    </NavLink>
                ))}
            </div>

            {/* Main Content */}
            <main className="flex-1 p-6 lg:p-10 pb-24 lg:pb-10 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
