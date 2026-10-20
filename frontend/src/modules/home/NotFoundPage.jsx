import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-16 bg-[var(--bg-page)] text-[var(--text-main)]">
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
                <span className="text-3xl font-mono font-black">404</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight mb-2">
                Page Not Found
            </h1>
            <p className="text-sm text-[var(--text-muted)] max-w-md mb-8 font-sans">
                The resource or listing you are looking for has moved, expired, or doesn’t exist in our verified catalog.
            </p>
            <div className="flex gap-4">
                <Link to="/" className="btn-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-wider">
                    ← Return Home
                </Link>
                <Link to="/marketplace" className="btn-secondary px-6 py-2.5 text-xs font-semibold uppercase tracking-wider">
                    Browse Marketplace
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;
