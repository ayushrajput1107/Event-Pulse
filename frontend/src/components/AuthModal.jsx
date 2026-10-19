import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, ArrowRight, Sparkles, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

/* ── Password Strength Meter ── */
const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8)  score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score, label: 'Weak',      color: 'bg-rose-500'   };
    if (score <= 2) return { score, label: 'Fair',      color: 'bg-amber-500'  };
    if (score <= 3) return { score, label: 'Good',      color: 'bg-yellow-400' };
    if (score <= 4) return { score, label: 'Strong',    color: 'bg-emerald-500'};
    return             { score, label: 'Very Strong', color: 'bg-emerald-400' };
};

export const AuthModal = () => {
    const { isAuthModalOpen, setIsAuthModalOpen, authModalMode, setAuthModalMode, login, register, loading } = useAuth();

    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
    const [errorMsg, setErrorMsg]   = useState('');
    const [showPass,  setShowPass]  = useState(false);

    /* Reset on mode change */
    useEffect(() => {
        setFormData({ firstName: '', lastName: '', email: '', password: '' });
        setErrorMsg('');
        setShowPass(false);
    }, [authModalMode]);

    if (!isAuthModalOpen) return null;

    const strength = getPasswordStrength(formData.password);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrorMsg('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (authModalMode === 'login') {
            if (!formData.email || !formData.password) {
                setErrorMsg('Please provide both email and password.');
                return;
            }
            const res = await login(formData.email, formData.password);
            if (!res?.success) setErrorMsg(res?.error || 'Invalid email or password.');
        } else {
            if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
                setErrorMsg('All fields are required.');
                return;
            }
            if (formData.password.length < 8) {
                setErrorMsg('Password must be at least 8 characters long.');
                return;
            }
            const res = await register(formData);
            if (!res?.success) setErrorMsg(res?.error || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg">
            <div
                className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden"
                style={{ animation: 'modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1)' }}
            >
                {/* Background accent glows */}
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-violet-600/12 rounded-full blur-3xl pointer-events-none" />

                {/* Top gradient stripe */}
                <div className="h-1 w-full bg-gradient-to-r from-indigo-600 via-violet-500 to-sky-500" />

                <div className="relative p-7 sm:p-9">
                    {/* Close Button */}
                    <button
                        onClick={() => setIsAuthModalOpen(false)}
                        className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Header */}
                    <div className="text-center mb-7">
                        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-xl shadow-indigo-500/30">
                            <Sparkles className="w-7 h-7 text-white" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-white tracking-tight">
                            {authModalMode === 'login' ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                            {authModalMode === 'login'
                                ? 'Sign in to access your tickets, events, and organizer tools.'
                                : 'Join EventPulse — explore, register and organize unforgettable events.'}
                        </p>
                    </div>

                    {/* Mode Selector Tabs */}
                    <div className="relative grid grid-cols-2 p-1.5 mb-7 rounded-2xl bg-slate-950 border border-slate-800">
                        {/* Animated sliding indicator */}
                        <div
                            className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/30 transition-transform duration-300"
                            style={{ transform: authModalMode === 'register' ? 'translateX(calc(100% + 0px))' : 'translateX(0)' }}
                        />
                        <button
                            onClick={() => { setAuthModalMode('login'); }}
                            className={`relative z-10 py-3 rounded-xl text-sm font-bold transition-colors duration-200 ${authModalMode === 'login' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => { setAuthModalMode('register'); }}
                            className={`relative z-10 py-3 rounded-xl text-sm font-bold transition-colors duration-200 ${authModalMode === 'register' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Register
                        </button>
                    </div>

                    {/* Error Alert */}
                    {errorMsg && (
                        <div className="mb-5 p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                            <p className="text-sm text-rose-300 font-medium">{errorMsg}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Name Row — Register only */}
                        {authModalMode === 'register' && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-slate-300">First Name</label>
                                    <div className="relative">
                                        <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            placeholder="Ayush"
                                            className="w-full pl-10 pr-4 py-3.5 rounded-xl glass-input text-sm"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-slate-300">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Rajput"
                                        className="w-full px-4 py-3.5 rounded-xl glass-input text-sm"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-slate-300">Email Address</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    className="w-full pl-10 pr-4 py-3.5 rounded-xl glass-input text-sm"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-semibold text-slate-300">Password</label>
                                {authModalMode === 'login' && (
                                    <button type="button" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                                        Forgot password?
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Min. 8 characters"
                                    className="w-full pl-10 pr-12 py-3.5 rounded-xl glass-input text-sm"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors"
                                    aria-label={showPass ? 'Hide password' : 'Show password'}
                                >
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Password strength meter — register only */}
                            {authModalMode === 'register' && formData.password.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div
                                                key={i}
                                                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                                    i <= strength.score ? strength.color : 'bg-slate-800'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-slate-500">
                                            {strength.label && (
                                                <span className={`font-semibold ${
                                                    strength.score <= 1 ? 'text-rose-400' :
                                                    strength.score <= 2 ? 'text-amber-400' :
                                                    strength.score <= 3 ? 'text-yellow-400' : 'text-emerald-400'
                                                }`}>{strength.label}</span>
                                            )} password
                                        </p>
                                        <p className="text-xs text-slate-600">{formData.password.length} chars</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Register perks reminder */}
                        {authModalMode === 'register' && (
                            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 space-y-2">
                                {[
                                    'Register for events and get digital QR passes',
                                    'Apply to become a verified organizer',
                                    'Track all your registrations in one place',
                                ].map(perk => (
                                    <div key={perk} className="flex items-center gap-2 text-xs text-indigo-300">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                        {perk}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-1 gradient-button py-4 rounded-xl font-bold text-base text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2.5 group hover:scale-[1.015] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                        >
                            {loading ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>{authModalMode === 'login' ? 'Signing in…' : 'Creating account…'}</span>
                                </>
                            ) : (
                                <>
                                    <span>{authModalMode === 'login' ? 'Sign In to Account' : 'Create My Account'}</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        {/* Switch mode hint */}
                        <p className="text-center text-sm text-slate-500 pt-1">
                            {authModalMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                            <button
                                type="button"
                                onClick={() => setAuthModalMode(authModalMode === 'login' ? 'register' : 'login')}
                                className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                            >
                                {authModalMode === 'login' ? 'Register now' : 'Sign in'}
                            </button>
                        </p>
                    </form>
                </div>
            </div>

            <style>{`
                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.92) translateY(16px); }
                    to   { opacity: 1; transform: scale(1)    translateY(0);    }
                }
            `}</style>
        </div>
    );
};
