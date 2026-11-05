import { memo } from 'react';
import { Link } from 'react-router-dom';

const EmptyState = memo(({
    icon,
    title = 'No items found',
    description = 'There are no active items matching your criteria right now.',
    actionLabel,
    actionLink,
    onAction
}) => {
    return (
        <div className="glass-card p-12 text-center flex flex-col items-center justify-center space-y-4 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                {icon || (
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                )}
            </div>

            <div className="space-y-1">
                <h3 className="text-base font-bold font-display text-[var(--text-main)]">{title}</h3>
                <p className="text-xs text-[var(--text-muted)] font-sans leading-relaxed">{description}</p>
            </div>

            {actionLabel && (
                actionLink ? (
                    <Link to={actionLink} className="btn-primary px-5 py-2 text-xs font-semibold">
                        {actionLabel}
                    </Link>
                ) : (
                    <button onClick={onAction} className="btn-primary px-5 py-2 text-xs font-semibold cursor-pointer">
                        {actionLabel}
                    </button>
                )
            )}
        </div>
    );
});

export default EmptyState;
