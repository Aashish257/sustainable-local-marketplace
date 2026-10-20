import { memo } from 'react';

/**
 * StatusBadge — Standardized lifecycle status pill
 * Statuses: 'pending', 'paid', 'shipped', 'delivered', 'cancelled'
 */
const StatusBadge = memo(({ status = 'pending' }) => {
    const s = String(status).toLowerCase();

    const config = {
        pending: {
            label: 'Payment Pending',
            classes: 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400',
            dot: 'bg-amber-500',
        },
        paid: {
            label: 'Paid & Processing',
            classes: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
            dot: 'bg-emerald-500',
        },
        shipped: {
            label: 'Dispatched / In Transit',
            classes: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-600 dark:text-cyan-400',
            dot: 'bg-cyan-500',
        },
        delivered: {
            label: 'Delivered',
            classes: 'bg-emerald-600/20 border-emerald-600/40 text-emerald-700 dark:text-emerald-300 font-bold',
            dot: 'bg-emerald-600',
        },
        cancelled: {
            label: 'Cancelled',
            classes: 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400',
            dot: 'bg-rose-500',
        },
    }[s] || {
        label: status.toUpperCase(),
        classes: 'bg-zinc-500/15 border-zinc-500/30 text-zinc-600 dark:text-zinc-400',
        dot: 'bg-zinc-500',
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${config.classes}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            <span>{config.label}</span>
        </span>
    );
});

export default StatusBadge;
