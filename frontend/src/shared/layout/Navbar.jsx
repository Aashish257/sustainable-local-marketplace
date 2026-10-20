import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';
import useThemeStore from '../../store/themeStore';
import CartDrawer from '../components/CartDrawer';
import { useCartStore } from '../../modules/cart/store/cartStore';

const Navbar = () => {
    const { token, user, logout } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();
    const navigate = useNavigate();
    const location = useLocation();

    const notifications = useNotificationStore((s) => s.notifications);
    const getUnreadCount = useNotificationStore((s) => s.getUnreadCount);
    const markAsRead = useNotificationStore((s) => s.markAsRead);

    const cart = useCartStore((s) => s.cart);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const [searchQuery, setSearchQuery] = useState('');
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [bellOpen, setBellOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);

    const userMenuRef = useRef(null);
    const bellRef = useRef(null);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
            if (bellRef.current && !bellRef.current.contains(e.target)) {
                setBellOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
        setUserMenuOpen(false);
    }, [location.pathname]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            navigate('/marketplace');
        }
    };

    const handleLogout = () => {
        logout();
        setUserMenuOpen(false);
        navigate('/login');
    };

    const handleNotificationClick = (n) => {
        markAsRead(n.id); // only the one clicked
        setBellOpen(false);
        navigate(n.link || '/');
    };

    const unreadCount = getUnreadCount();
    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <>
            <header className="sticky top-0 z-40 bg-[var(--bg-surface)]/85 dark:bg-[#041c15]/85 backdrop-blur-xl border-b border-[var(--border-card)] transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 gap-4">
                        
                        {/* 1. Brand Logo */}
                        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
                            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2a9 9 0 0 1 9 9c0 4.97-4.03 9-9 9A9 9 0 0 1 3 11C3 6.03 7.03 2 12 2z" />
                                    <path d="M12 2v20" />
                                    <path d="M12 12c-3-2-5-1-6 2" />
                                    <path d="M12 8c3-2 5-1 6 2" />
                                </svg>
                            </div>
                            <div>
                                <span className="text-base font-black font-display tracking-tight text-[var(--text-main)] block leading-none">
                                    Sustain<span className="text-emerald-600 dark:text-emerald-400">Market</span>
                                </span>
                                <span className="text-[10px] font-mono tracking-wider text-[var(--text-muted)] block uppercase mt-0.5">
                                    Local Verified
                                </span>
                            </div>
                        </Link>

                        {/* 2. Desktop Navigation Links */}
                        <nav className="hidden lg:flex items-center gap-6 font-sans text-xs font-semibold">
                            <NavLink
                                to="/marketplace"
                                className={({ isActive }) =>
                                    `transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
                                        isActive ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-[var(--text-muted)]'
                                    }`
                                }
                            >
                                Marketplace
                            </NavLink>
                            <NavLink
                                to="/how-it-works"
                                className={({ isActive }) =>
                                    `transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
                                        isActive ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-[var(--text-muted)]'
                                    }`
                                }
                            >
                                How It Works
                            </NavLink>
                            <NavLink
                                to="/about"
                                className={({ isActive }) =>
                                    `transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
                                        isActive ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-[var(--text-muted)]'
                                    }`
                                }
                            >
                                About Mission
                            </NavLink>
                        </nav>

                        {/* 3. Global Search Input */}
                        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xs relative">
                            <input
                                type="text"
                                placeholder="Search organic products, artisans..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 text-xs bg-black/5 dark:bg-white/5 border border-[var(--border-card)] rounded-lg text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                            <svg className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </form>

                        {/* 4. Actions: Theme, Notifications, Cart, Profile */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                                aria-label="Toggle light or dark theme"
                            >
                                {theme === 'dark' ? (
                                    <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                )}
                            </button>

                            {/* Notifications Bell */}
                            {token && (
                                <div className="relative" ref={bellRef}>
                                    <button
                                        onClick={() => setBellOpen(!bellOpen)}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors relative cursor-pointer"
                                        aria-label="View notifications"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        )}
                                    </button>

                                    {/* Dropdown */}
                                    {bellOpen && (
                                        <div className="absolute right-0 mt-2 w-80 glass-card p-4 shadow-xl z-50 animate-in fade-in zoom-in-95">
                                            <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-2 mb-3">
                                                <span className="text-xs font-bold font-display text-[var(--text-main)]">Notifications</span>
                                                <Link to="/notifications" onClick={() => setBellOpen(false)} className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline">
                                                    View All
                                                </Link>
                                            </div>
                                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                                {notifications.length === 0 ? (
                                                    <p className="text-xs text-[var(--text-muted)] text-center py-4">No notifications yet</p>
                                                ) : (
                                                    notifications.slice(0, 5).map((n, i) => (
                                                        <div
                                                            key={n.id || i}
                                                            onClick={() => handleNotificationClick(n)}
                                                            className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-emerald-500/10 cursor-pointer text-xs transition-colors"
                                                        >
                                                            <p className="font-medium text-[var(--text-main)] line-clamp-2">{n.message}</p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Direct Messages Shortcut */}
                            {token && (
                                <Link
                                    to="/messages"
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors relative"
                                    aria-label="Direct messages"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </Link>
                            )}

                            {/* Shopping Cart Trigger */}
                            <button
                                onClick={() => setCartOpen(true)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors relative cursor-pointer"
                                aria-label={`Open shopping cart with ${cartCount} items`}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-emerald-600 text-white font-mono text-[10px] font-bold">
                                        {cartCount}
                                    </span>
                                )}
                            </button>

                            {/* Role Navigation Button */}
                            {user?.role === 'seller' && (
                                <Link
                                    to="/dashboard"
                                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all"
                                >
                                    <span>STUDIO</span>
                                </Link>
                            )}

                            {user?.role === 'admin' && (
                                <Link
                                    to="/admin"
                                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-mono text-xs font-bold hover:bg-amber-500 hover:text-[#041c15] transition-all"
                                >
                                    <span>GOVERN</span>
                                </Link>
                            )}

                            {/* User Profile / Auth State */}
                            {token ? (
                                <div className="relative" ref={userMenuRef}>
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-xs font-bold font-display text-emerald-600 dark:text-emerald-400 hover:scale-105 transition-transform cursor-pointer"
                                        aria-label="Open user menu"
                                    >
                                        {initials}
                                    </button>

                                    {/* Dropdown */}
                                    {userMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 glass-card p-2 shadow-xl z-50 text-xs">
                                            <div className="px-3 py-2 border-b border-[var(--border-card)] mb-1">
                                                <p className="font-bold text-[var(--text-main)] truncate">{user?.name}</p>
                                                <p className="text-[10px] text-[var(--text-muted)] font-mono truncate">{user?.email}</p>
                                            </div>

                                            <Link
                                                to="/profile"
                                                onClick={() => setUserMenuOpen(false)}
                                                className="block px-3 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-main)]"
                                            >
                                                Account Profile
                                            </Link>
                                            <Link
                                                to="/orders"
                                                onClick={() => setUserMenuOpen(false)}
                                                className="block px-3 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-main)]"
                                            >
                                                My Orders
                                            </Link>

                                            {user?.role === 'seller' && (
                                                <Link
                                                    to="/dashboard"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="block px-3 py-2 rounded-md text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-500/10"
                                                >
                                                    Seller Studio
                                                </Link>
                                            )}

                                            {user?.role === 'admin' && (
                                                <Link
                                                    to="/admin"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="block px-3 py-2 rounded-md text-amber-600 dark:text-amber-400 font-bold hover:bg-amber-500/10"
                                                >
                                                    Governance Admin
                                                </Link>
                                            )}

                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-3 py-2 rounded-md text-rose-500 hover:bg-rose-500/10 transition-colors mt-1 pt-1 border-t border-[var(--border-card)]"
                                            >
                                                Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link to="/login" className="px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                                        Sign In
                                    </Link>
                                    <Link to="/register" className="btn-primary px-3.5 py-1.5 text-xs font-semibold">
                                        Join
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Hamburger Toggle */}
                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)]"
                                aria-label="Toggle mobile menu"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                        </div>

                    </div>
                </div>

                {/* Mobile Drawer Menu */}
                {mobileOpen && (
                    <div className="lg:hidden border-t border-[var(--border-card)] bg-[var(--bg-surface)] dark:bg-[#041c15] p-4 space-y-3 font-sans text-sm">
                        <form onSubmit={handleSearch} className="relative mb-3">
                            <input
                                type="text"
                                placeholder="Search catalog..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-xs bg-black/5 dark:bg-white/5 border border-[var(--border-card)] rounded-lg text-[var(--text-main)]"
                            />
                            <svg className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </form>

                        <Link to="/marketplace" className="block py-2 text-[var(--text-main)] hover:text-emerald-500 font-medium">
                            Marketplace Catalog
                        </Link>
                        <Link to="/how-it-works" className="block py-2 text-[var(--text-main)] hover:text-emerald-500 font-medium">
                            How It Works
                        </Link>
                        <Link to="/about" className="block py-2 text-[var(--text-main)] hover:text-emerald-500 font-medium">
                            About Mission
                        </Link>
                        {token && (
                            <>
                                <Link to="/orders" className="block py-2 text-[var(--text-main)] hover:text-emerald-500 font-medium">
                                    My Orders
                                </Link>
                                <Link to="/messages" className="block py-2 text-[var(--text-main)] hover:text-emerald-500 font-medium">
                                    Direct Messages
                                </Link>
                                <Link to="/notifications" className="block py-2 text-[var(--text-main)] hover:text-emerald-500 font-medium">
                                    Notifications
                                </Link>
                                <Link to="/profile" className="block py-2 text-[var(--text-main)] hover:text-emerald-500 font-medium">
                                    Profile
                                </Link>
                            </>
                        )}
                        {user?.role === 'seller' && (
                            <Link to="/dashboard" className="block py-2 text-emerald-600 dark:text-emerald-400 font-bold">
                                Seller Studio Dashboard →
                            </Link>
                        )}
                        {user?.role === 'admin' && (
                            <Link to="/admin" className="block py-2 text-amber-600 dark:text-amber-400 font-bold">
                                Governance Admin Portal →
                            </Link>
                        )}
                    </div>
                )}
            </header>

            {/* Slide-over Cart Drawer */}
            <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
        </>
    );
};

export default Navbar;
