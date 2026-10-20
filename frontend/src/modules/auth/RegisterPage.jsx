import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from './api';
import ThreeAuthBackground from '../../shared/components/ThreeAuthBackground';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('buyer');
    const [showPassword, setShowPassword] = useState(false);
    const [consent, setConsent] = useState(false);

    const mutation = useMutation({
        mutationFn: registerUser,
        onSuccess: () => {
            navigate('/login');
        }
    });

    const roles = [
        {
            value: 'buyer',
            label: 'Conscious Buyer',
            desc: 'Shop verified organic items and join live producer drops'
        },
        {
            value: 'seller',
            label: 'Artisan / Seller',
            desc: 'List sustainable products, launch auctions, and fulfill orders'
        }
    ];

    return (
        <div className="min-h-screen flex bg-[var(--bg-page)] text-[var(--text-main)]">
            {/* ===== LEFT — Brand Panel ===== */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 bg-emerald-950/20 dark:bg-[#041c15] border-r border-[var(--border-card)]">
                <ThreeAuthBackground />
                
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 -left-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 font-display font-black text-sm">
                        🌿
                    </div>
                    <div>
                        <span className="font-bold text-[var(--text-main)] text-lg tracking-tight font-display">SustainMarket</span>
                        <div className="text-[var(--text-muted)] text-[10px] font-mono uppercase tracking-widest">COMMUNITY ENROLLMENT</div>
                    </div>
                </div>

                {/* Main content */}
                <div className="relative z-10 space-y-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium text-xs uppercase tracking-wider">
                        <span>✦ CIRCULAR PARTICIPATION</span>
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-extrabold font-display leading-tight text-[var(--text-main)]">
                        Local Commerce, <br />
                        <span className="text-emerald-600 dark:text-emerald-400">
                            Rooted in Nature.
                        </span>
                    </h2>
                    <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-md font-sans">
                        Join thousands of conscious consumers and verified local producers building transparent, low-emission community trade.
                    </p>

                    {/* Value propositions */}
                    <div className="mt-6 space-y-3">
                        {[
                            { title: 'Verified Local Origins', desc: 'Every producer passes transparent footprint checks' },
                            { title: '0–10 Sustainability Rating', desc: 'Packaging, transit, and regenerative cultivation metrics' },
                            { title: 'Real-Time Producer Drops', desc: 'WebSocket powered auctions for limited harvest goods' }
                        ].map(f => (
                            <div key={f.title} className="glass-card p-4">
                                <p className="text-xs font-bold text-[var(--text-main)] font-display">{f.title}</p>
                                <p className="text-[var(--text-muted)] text-xs font-sans mt-0.5">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 font-mono text-xs text-[var(--text-muted)] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>OVER ~2.4 TONS CO₂ OFFSET RECORDED</span>
                </div>
            </div>

            {/* ===== RIGHT — Form Panel ===== */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
                <div className="w-full max-w-md glass-card p-8 rounded-3xl shadow-2xl relative z-10 space-y-6">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 font-display font-bold text-xs">
                            🌿
                        </div>
                        <span className="font-bold text-lg font-display text-[var(--text-main)]">SustainMarket</span>
                    </div>

                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black font-display text-[var(--text-main)] tracking-tight">Create an Account</h1>
                        <p className="text-[var(--text-muted)] text-xs mt-1 font-sans">
                            Already part of our network?{' '}
                            <Link to="/login" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                                Sign in here →
                            </Link>
                        </p>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); mutation.mutate({ name, email, password, role, consent }); }} className="space-y-4">
                        {/* Role selector */}
                        <div>
                            <label className="block text-xs font-semibold text-[var(--text-main)] uppercase tracking-wider mb-2 font-mono">Select Your Role</label>
                            <div className="grid grid-cols-2 gap-2.5">
                                {roles.map(r => (
                                    <button
                                        key={r.value}
                                        type="button"
                                        onClick={() => setRole(r.value)}
                                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${role === r.value
                                            ? 'border-emerald-500 bg-emerald-500/10 shadow-sm shadow-emerald-500/20'
                                            : 'border-[var(--border-card)] bg-[var(--bg-page)] hover:border-emerald-500/50'
                                            }`}
                                    >
                                        <div className="font-bold text-[var(--text-main)] text-xs font-display">{r.label}</div>
                                        <div className="text-[var(--text-muted)] text-[10px] mt-1 font-sans leading-tight">{r.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className="block text-xs font-semibold text-[var(--text-main)] uppercase tracking-wider mb-1.5 font-mono">Full Name</label>
                            <input
                                id="register-name"
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-[var(--bg-page)] border border-[var(--border-card)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-emerald-500 transition-colors"
                                placeholder="Aashish / Sustainable Producer"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-[var(--text-main)] uppercase tracking-wider mb-1.5 font-mono">Email Address</label>
                            <input
                                id="register-email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[var(--bg-page)] border border-[var(--border-card)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-emerald-500 transition-colors"
                                placeholder="artisan@sustainmarket.io"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-semibold text-[var(--text-main)] uppercase tracking-wider mb-1.5 font-mono">Password</label>
                            <div className="relative">
                                <input
                                    id="register-password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[var(--bg-page)] border border-[var(--border-card)] rounded-xl px-4 py-2.5 pr-10 text-xs text-[var(--text-main)] focus:outline-none focus:border-emerald-500 transition-colors"
                                    placeholder="Min. 6 characters"
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

                        {/* Privacy consent (required by the API) */}
                        <label htmlFor="register-consent" className="flex items-start gap-2 text-xs text-[var(--text-muted)] cursor-pointer">
                            <input
                                id="register-consent"
                                type="checkbox"
                                checked={consent}
                                onChange={(e) => setConsent(e.target.checked)}
                                required
                                className="mt-0.5 accent-emerald-600"
                            />
                            <span>I agree to the privacy policy and consent to my data being stored to run my account.</span>
                        </label>

                        {/* Error */}
                        {mutation.isError && (
                            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 p-3 rounded-xl text-xs font-sans text-center">
                                <span>{mutation.error?.response?.data?.error || 'Registration failed. Please check your inputs.'}</span>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            id="register-submit"
                            type="submit"
                            disabled={mutation.isPending || !consent}
                            className="btn-primary w-full py-3 text-xs font-semibold uppercase tracking-wider disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {mutation.isPending ? 'Registering…' : `Register as ${role === 'seller' ? 'Artisan Seller' : 'Conscious Buyer'} →`}
                        </button>
                    </form>

                    <p className="text-center font-mono text-[10px] text-[var(--text-muted)]">
                        BY JOINING YOU COMMIT TO ETHICAL, LOCAL SUSTAINABILITY PRINCIPLES
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
