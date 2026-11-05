import { memo } from 'react';

const ErrorState = memo(({
    title = 'Something went wrong',
    description = 'We were unable to complete your request. Please try again.',
    onRetry
}) => {
    return (
        <div className="glass-card p-10 text-center flex flex-col items-center justify-center space-y-4 max-w-md mx-auto border-rose-500/30">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>

            <div className="space-y-1">
                <h3 className="text-base font-bold font-display text-[var(--text-main)]">{title}</h3>
                <p className="text-xs text-[var(--text-muted)] font-sans leading-relaxed">{description}</p>
            </div>

            {onRetry && (
                <button
                    onClick={onRetry}
                    className="btn-secondary px-5 py-2 text-xs font-semibold cursor-pointer border-rose-500/30 text-rose-500 hover:border-rose-500"
                >
                    Try Again
                </button>
            )}
        </div>
    );
});

export default ErrorState;
