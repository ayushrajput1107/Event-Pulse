import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Calendar, PlusCircle, ShieldCheck, Ticket, User, LogOut, ChevronDown, Layers, Search, Home, LayoutDashboard } from 'lucide-react';

export const Navbar = () => {
    const { user, logout, openAuthModal } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const role = user?.authorization?.role || 'ATTENDEE';

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getRoleBadge = (userRole) => {
        switch (userRole) {
            case 'ADMIN':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">ADMIN</span>;
            case 'VERIFIED_ORGANIZER':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">VERIFIED ORGANIZER</span>;
            case 'ORGANIZER':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">ORGANIZER (PENDING)</span>;
            default:
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">ATTENDEE</span>;
        }
    };

    const getRoleAccentColor = (userRole) => {
        switch (userRole) {
            case 'ADMIN': return 'from-amber-500 to-orange-500';
            case 'VERIFIED_ORGANIZER': return 'from-emerald-500 to-teal-500';
            case 'ORGANIZER': return 'from-purple-500 to-violet-600';
            default: return 'from-indigo-500 to-violet-600';
        }
    };

    const dashboardPath = role === 'ADMIN' ? '/admin' : role === 'VERIFIED_ORGANIZER' ? '/organizer' : '/dashboard';
    const isDashboardActive = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/organizer') || location.pathname.startsWith('/admin');

    return (
        <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 group-hover:shadow-indigo-500/50 transition-all duration-300">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                            Event<span className="gradient-text">Pulse</span>
                        </span>
                        <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Platform Hub</span>
                    </div>
                </Link>

                {/* Navigation Links */}
                <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-full border border-slate-800">
                    <Link
                        to="/"
                        className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${location.pathname === '/'
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                            }`}
                    >
                        <Home className="w-4 h-4" />
                        Explore Events
                    </Link>

                    {user && (
                        <Link
                            to={dashboardPath}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${isDashboardActive
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                                }`}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                        </Link>
                    )}
                </nav>

                {/* Right Section */}
                <div className="flex items-center gap-3">

                    {/* User Profile / Auth Action */}
                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-3 p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all duration-200 group"
                            >
                                {/* Avatar */}
                                <div className={`w-9 h-9 rounded-lg bg-gradient-to-tr ${getRoleAccentColor(role)} flex items-center justify-center font-bold text-white text-sm shadow group-hover:scale-105 transition-transform`}>
                                    {user.profile?.firstName?.[0]?.toUpperCase() || 'U'}
                                </div>
                                {/* Name only — no email */}
                                <div className="hidden sm:flex flex-col text-left pr-1">
                                    <span className="text-sm font-semibold text-white leading-tight">
                                        {user.profile?.firstName} {user.profile?.lastName}
                                    </span>
                                    <span className="text-[10px] text-slate-400 mt-0.5">{role.replace('_', ' ')}</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 mt-3 w-60 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/50 py-2 z-50 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                                    {/* Profile Header in Dropdown */}
                                    <div className="px-4 py-3 border-b border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${getRoleAccentColor(role)} flex items-center justify-center font-bold text-white text-base shadow shrink-0`}>
                                                {user.profile?.firstName?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-white truncate">{user.profile?.firstName} {user.profile?.lastName}</p>
                                                <div className="mt-1">{getRoleBadge(role)}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="py-1.5 px-2">
                                        <Link
                                            to="/dashboard"
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-all"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                                                <Ticket className="w-4 h-4 text-indigo-400" />
                                            </div>
                                            My Tickets & Registrations
                                        </Link>

                                        {role === 'VERIFIED_ORGANIZER' && (
                                            <Link
                                                to="/organizer"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-all"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                                    <PlusCircle className="w-4 h-4 text-emerald-400" />
                                                </div>
                                                Organizer Control Panel
                                            </Link>
                                        )}

                                        {role === 'ADMIN' && (
                                            <Link
                                                to="/admin"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-all"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                                                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                                                </div>
                                                Admin Console
                                            </Link>
                                        )}
                                    </div>

                                    <div className="border-t border-slate-800 pt-1.5 pb-1 px-2">
                                        <button
                                            onClick={() => {
                                                logout();
                                                setDropdownOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 rounded-xl transition-all"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
                                                <LogOut className="w-4 h-4" />
                                            </div>
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => openAuthModal('login')}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => openAuthModal('register')}
                                className="gradient-button px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.02] transition-transform"
                            >
                                Get Started
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
