import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const ProfilePage = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-5">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-[var(--text-main)]">
                            Your Profile
                        </h1>
                        <p className="text-xs text-[var(--text-muted)] font-mono mt-1">
                            ACCOUNT ID: {user?.id || user?._id || 'ANONYMOUS'}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-xs font-semibold text-rose-500 hover:text-rose-400 border border-rose-500/30 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        Sign Out
                    </button>
                </div>

                {/* Profile Details Card */}
                <div className="glass-card p-6 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-xl font-bold font-display text-emerald-600 dark:text-emerald-400">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[var(--text-main)]">{user?.name}</h2>
                            <p className="text-xs text-[var(--text-muted)] font-mono">{user?.email}</p>
                            <span className="inline-block mt-2 text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                                ROLE: {user?.role || 'BUYER'}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[var(--border-card)] text-xs font-sans">
                        <div>
                            <span className="text-[var(--text-muted)] block mb-1">Full Legal Name</span>
                            <span className="font-semibold text-[var(--text-main)]">{user?.name}</span>
                        </div>
                        <div>
                            <span className="text-[var(--text-muted)] block mb-1">Verified Email</span>
                            <span className="font-semibold text-[var(--text-main)]">{user?.email}</span>
                        </div>
                        <div>
                            <span className="text-[var(--text-muted)] block mb-1">Marketplace Tier</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Standard Verified</span>
                        </div>
                        <div>
                            <span className="text-[var(--text-muted)] block mb-1">Carbon Footprint Status</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active Participant</span>
                        </div>
                    </div>
                </div>

                {/* Role Specific Shortcuts */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[var(--text-muted)]">
                        Workspace Actions
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link to="/orders" className="glass-card p-4 hover:border-emerald-500/50 transition-colors flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-bold text-[var(--text-main)]">My Orders</h4>
                                <p className="text-xs text-[var(--text-muted)]">Track shipments &amp; reviews</p>
                            </div>
                            <span className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">→</span>
                        </Link>

                        <Link to="/messages" className="glass-card p-4 hover:border-emerald-500/50 transition-colors flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-bold text-[var(--text-main)]">Direct Messages</h4>
                                <p className="text-xs text-[var(--text-muted)]">Chat with artisan sellers</p>
                            </div>
                            <span className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">→</span>
                        </Link>

                        {user?.role === 'seller' && (
                            <Link to="/dashboard" className="glass-card p-4 hover:border-emerald-500/50 transition-colors flex items-center justify-between sm:col-span-2 bg-emerald-500/5 border-emerald-500/30">
                                <div>
                                    <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Seller Studio Dashboard</h4>
                                    <p className="text-xs text-[var(--text-muted)]">Manage inventory, fulfillment, and live auctions</p>
                                </div>
                                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">LAUNCH →</span>
                            </Link>
                        )}

                        {user?.role === 'admin' && (
                            <Link to="/admin" className="glass-card p-4 hover:border-emerald-500/50 transition-colors flex items-center justify-between sm:col-span-2 bg-emerald-500/5 border-emerald-500/30">
                                <div>
                                    <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Admin dashboard</h4>
                                    <p className="text-xs text-[var(--text-muted)]">User moderation, catalog controls, and metrics</p>
                                </div>
                                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">GOVERN →</span>
                            </Link>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProfilePage;
