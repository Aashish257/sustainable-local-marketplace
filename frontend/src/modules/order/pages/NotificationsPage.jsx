import { Link } from 'react-router-dom';
import useNotificationStore from '../../../store/notificationStore';

const NotificationsPage = () => {
    const notifications = useNotificationStore((s) => s.notifications);
    const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
    const clearAll = useNotificationStore((s) => s.clearAll);

    return (
        <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-[var(--text-main)]">
                            Notifications
                        </h1>
                        <p className="text-xs text-[var(--text-muted)] font-mono mt-1">
                            REAL-TIME MARKETPLACE DISPATCHES &amp; ALERTS
                        </p>
                    </div>
                    {notifications.length > 0 && (
                        <div className="flex gap-2">
                            <button
                                onClick={markAllAsRead}
                                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline px-2 py-1"
                            >
                                Mark All Read
                            </button>
                            <button
                                onClick={clearAll}
                                className="text-xs font-semibold text-rose-500 hover:underline px-2 py-1"
                            >
                                Clear All
                            </button>
                        </div>
                    )}
                </div>

                {/* Notifications List */}
                {notifications.length === 0 ? (
                    <div className="glass-card p-12 text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <h2 className="text-base font-bold text-[var(--text-main)]">No active notifications</h2>
                        <p className="text-xs text-[var(--text-muted)] font-sans max-w-sm mx-auto">
                            You're all caught up. When bids update, orders ship, or messages arrive, they will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((n, i) => (
                            <Link
                                key={n.id || i}
                                to={n.link || '/'}
                                className="glass-card p-4 flex items-start justify-between gap-4 block hover:border-emerald-500/40 transition-colors"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${n.read ? 'bg-zinc-500' : 'bg-emerald-500 animate-pulse'}`} />
                                        <span className="text-xs font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
                                            {n.type || 'SYSTEM'}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-[var(--text-main)] leading-snug">
                                        {n.message}
                                    </p>
                                </div>
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono flex-shrink-0">
                                    VIEW →
                                </span>
                            </Link>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default NotificationsPage;
