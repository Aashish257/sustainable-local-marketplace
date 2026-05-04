import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';

const Navbar = () => {
    const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();

    const notifications = useNotificationStore((s) => s.notifications);
    const getUnreadCount = useNotificationStore((s) => s.getUnreadCount);
    const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
    const clearAll = useNotificationStore((s) => s.clearAll);

    const [bellOpen, setBellOpen] = useState(false);
    const bellRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (bellRef.current && !bellRef.current.contains(e.target)) {
                setBellOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleNotificationClick = (n) => {
        markAllAsRead();
        setBellOpen(false);
        navigate(n.link || '/');
    };

    const unreadCount = getUnreadCount();

    return (
        <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link to="/products" className="flex items-center gap-2 text-green-700 font-extrabold text-xl">
                    🌱 <span>SustainMarket</span>
                </Link>

                {/* Nav Links + Actions */}
                <div className="flex items-center gap-4">
                    <Link to="/products" className="text-gray-600 hover:text-green-600 text-sm font-medium transition-colors hidden md:block">
                        Products
                    </Link>
                    <Link to="/cart" className="text-gray-600 hover:text-green-600 text-sm font-medium transition-colors">
                        🛒 Cart
                    </Link>

                    {token && user?.role === 'seller' && (
                        <Link to="/dashboard" className="text-gray-600 hover:text-green-600 text-sm font-medium transition-colors hidden md:block">
                            Dashboard
                        </Link>
                    )}

                    {/* Notification Bell */}
                    {token && (
                        <div className="relative" ref={bellRef}>
                            <button
                                onClick={() => { setBellOpen(!bellOpen); markAllAsRead(); }}
                                className="relative p-2 text-gray-600 hover:text-green-600 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.437L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown */}
                            {bellOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b flex justify-between items-center">
                                        <h4 className="font-bold text-gray-800">Notifications</h4>
                                        {notifications.length > 0 && (
                                            <button onClick={clearAll} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                                                Clear all
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <p className="text-center text-gray-400 text-sm py-8">No notifications yet</p>
                                        ) : (
                                            notifications.slice(0, 10).map((n) => (
                                                <button
                                                    key={n.id}
                                                    onClick={() => handleNotificationClick(n)}
                                                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 transition-colors flex items-start gap-3 ${!n.isRead ? 'bg-green-50' : ''}`}
                                                >
                                                    <span className="text-lg mt-0.5">
                                                        {n.type === 'chat' ? '💬' : n.type === 'bid' ? '🔨' : '📦'}
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-gray-700 font-medium">{n.message}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">
                                                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                    {!n.isRead && <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Auth Actions */}
                    {token ? (
                        <div className="flex items-center gap-3 ml-2 border-l border-gray-200 pl-4">
                            <span className="text-sm font-medium text-gray-700 hidden md:block">
                                Welcome, {user?.name || 'User'}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="text-sm bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 px-4 py-2 rounded-lg font-medium transition-all"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/login" className="text-sm text-gray-600 hover:text-green-600 font-medium transition-colors">
                                Login
                            </Link>
                            <Link to="/register" className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all">
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
