import { homeFor } from '../../app/roles';
import { Leaf } from 'lucide-react';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { loginUser } from './api';
import useAuthStore from '../../store/authStore';
import ThreeAuthBackground from '../../shared/components/ThreeAuthBackground';

const LoginPage = () => {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const location = useLocation();

    const mutation = useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            login(data.data.user, data.data.token);
            // Back to the page that asked for login (buyers), else the role's home
            const role = data.data.user?.role;
            navigate(role === 'buyer' && location.state?.from ? location.state.from : homeFor(role), { replace: true });
        }
    });

    return (
        <div className="min-h-screen flex bg-[var(--bg-page)] text-[var(--text-main)]">
            {/* ===== LEFT — Brand Panel ===== */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 bg-emerald-950/20 dark:bg-[#041c15] border-r border-[var(--border-card)]">
                <ThreeAuthBackground />
                
                {/* Abstract ambient glows */}
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 font-display font-black text-sm">
                        <Leaf className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                        <span className="font-bold text-[var(--text-main)] text-lg tracking-tight font-display">SustainMarket</span>
                        <div className="text-[var(--text-muted)] text-xs font-mono uppercase tracking-widest">LIVING BIOSPHERE ACCESS</div>
                    </div>
                </div>

                {/* Main content */}
                <div className="relative z-10 space-y-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium text-xs uppercase tracking-wider">
                        <span>Local, verified sellers</span>
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-extrabold font-display leading-tight text-[var(--text-main)]">
                        Connecting People with <br />
                        <span className="text-emerald-600 dark:text-emerald-400">
                            Pure Local Origins.
                        </span>
                    </h2>
                    <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-md font-sans">
                        Zero middlemen, audited carbon accounting, and direct peer-to-peer relationships with independent producers.
                    </p>

                    {/* Stats */}
                    <div className="mt-8 grid grid-cols-3 gap-3 font-mono">
                        {[
                            { val: '500+', label: 'PRODUCERS' },
                            { val: '12K+', label: 'BUYERS' },
                            { val: '100%', label: 'NET ZERO' }
                        ].map(s => (
                            <div key={s.label} className="glass-card p-3.5 text-center">
                                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-display">{s.val}</div>
                                <div className="text-[var(--text-muted)] text-xs uppercase mt-0.5">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer status */}
                <div className="relative z-10 flex items-center gap-2 font-mono text-xs text-[var(--text-muted)]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Payments secured by Razorpay</span>
                </div>
            </div>

            {/* ===== RIGHT — Form Panel ===== */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
                <div className="w-full max-w-md glass-card p-8 rounded-3xl shadow-2xl relative z-10 space-y-6">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 font-display font-bold text-xs">
                            <Leaf className="w-4 h-4" aria-hidden="true" />
                        </div>
                        <span className="font-bold text-lg font-display text-[var(--text-main)]">SustainMarket</span>
                    </div>

                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black font-display text-[var(--text-main)] tracking-tight">Welcome Back</h1>
                        <p className="text-[var(--text-muted)] text-xs mt-1 font-sans">
                            Don't have an account yet?{' '}
                            <Link to="/register" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                                Register free →
                            </Link>
                        </p>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); mutation.mutate({ email, password }); }} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-[var(--text-main)] uppercase tracking-wider mb-1.5 font-mono">Email Address</label>
                            <input
                                id="login-email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[var(--bg-page)] border border-[var(--border-card)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-emerald-500 transition-colors"
                                placeholder="name@example.com"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-xs font-semibold text-[var(--text-main)] uppercase tracking-wider font-mono">Password</label>
                            </div>
                            <div className="relative">
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[var(--bg-page)] border border-[var(--border-card)] rounded-xl px-4 py-2.5 pr-10 text-xs text-[var(--text-main)] focus:outline-none focus:border-emerald-500 transition-colors"
                                    placeholder="••••••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                                >
                                    {showPassword ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {mutation.isError && (
                            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 p-3 rounded-xl text-xs font-sans text-center">
                                <span>{mutation.error?.response?.data?.error || 'Authentication failed. Please check your credentials.'}</span>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            id="login-submit"
                            type="submit"
                            disabled={mutation.isPending}
                            className="btn-primary w-full py-3 text-xs font-semibold uppercase tracking-wider disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {mutation.isPending ? 'Authenticating…' : 'Sign In →'}
                        </button>
                    </form>

                    <p className="text-center font-mono text-xs text-[var(--text-muted)]">
                        Secure sign-in · Payments by Razorpay
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
