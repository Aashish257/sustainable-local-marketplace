import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import useAuthStore from '../../../store/authStore';
import ThreeImpactSphere from '../../../shared/components/ThreeImpactSphere';

const SuccessPage = () => {
    const { user } = useAuthStore();
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 100);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] flex items-center justify-center px-4 py-16 transition-colors duration-300">
            <div className="max-w-lg w-full text-center space-y-6">

                {/* Animated Emerald Badge */}
                <div
                    className={`relative w-20 h-20 mx-auto transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        visible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                    }`}
                >
                    <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 animate-ping" style={{ animationDuration: '2.5s' }} />
                    <div className="absolute inset-0 rounded-2xl bg-emerald-600 border border-emerald-400 shadow-xl shadow-emerald-600/30 flex items-center justify-center text-white">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>

                {/* Heading & Order ID */}
                <div className="space-y-2">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                        ✓ Payment verified
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-[var(--text-main)]">
                        Order Confirmed!
                    </h1>
                    <p className="text-sm text-[var(--text-muted)] font-sans">
                        Thank you{user?.name ? `, ${user.name}` : ''}! Your purchase directly supports verified local producers.
                    </p>
                    {orderId && (
                        <p className="text-xs font-mono text-[var(--text-muted)]">
                            ORDER REFERENCE: #{orderId}
                        </p>
                    )}
                </div>

                {/* Sustainability Certificate Card with 3D Impact Orb */}
                <div className="glass-card p-6 space-y-4 text-left">
                    <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-3">
                        <span className="text-xs font-bold font-display text-[var(--text-main)] uppercase tracking-wider">
                            Verified Impact Certificate
                        </span>
                        <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                            AUDIT PASSED
                        </span>
                    </div>

                    <div className="h-32 relative flex items-center justify-center overflow-hidden">
                        <ThreeImpactSphere co2Saved={2.4} />
                    </div>

                    <div className="grid grid-cols-3 gap-3 font-mono text-center pt-2">
                        <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border-card)]">
                            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">~2.4kg</p>
                            <p className="text-[9px] text-[var(--text-muted)] uppercase mt-0.5">CO₂ Offset</p>
                        </div>
                        <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border-card)]">
                            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">100%</p>
                            <p className="text-[9px] text-[var(--text-muted)] uppercase mt-0.5">Zero Plastic</p>
                        </div>
                        <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border-card)]">
                            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">Direct</p>
                            <p className="text-[9px] text-[var(--text-muted)] uppercase mt-0.5">Artisan Payout</p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Link
                        to={orderId ? `/orders/${orderId}` : '/orders'}
                        className="btn-primary flex-1 py-3 text-xs uppercase font-bold tracking-wider text-center"
                    >
                        View Order Details →
                    </Link>
                    <Link
                        to="/marketplace"
                        className="btn-secondary flex-1 py-3 text-xs uppercase font-bold tracking-wider text-center"
                    >
                        Continue Shopping
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default SuccessPage;
