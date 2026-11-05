import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const PaymentFailurePage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const reason = searchParams.get('reason') || 'Transaction was canceled or declined by gateway.';

    return (
        <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-16 bg-[var(--bg-page)] text-[var(--text-main)]">
            <div className="w-20 h-20 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-6">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h1 className="text-3xl font-extrabold font-display tracking-tight mb-2">
                Payment Was Not Completed
            </h1>
            <p className="text-sm text-[var(--text-muted)] max-w-md mb-2 font-sans">
                {reason}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-8">
                ✓ Your selected cart items have been safely preserved.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
                <button
                    onClick={() => navigate('/checkout')}
                    className="btn-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-wider"
                >
                    Retry Payment
                </button>
                <Link
                    to="/cart"
                    className="btn-secondary px-6 py-2.5 text-xs font-semibold uppercase tracking-wider"
                >
                    Review Cart
                </Link>
            </div>
        </div>
    );
};

export default PaymentFailurePage;
