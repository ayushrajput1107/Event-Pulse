import React, { useState, useEffect } from 'react';
import { eventAPI } from '../services/api';
import { EventCard } from '../components/EventCard';
import { Search, Sparkles, Filter, Calendar, Users, Award, Zap, ChevronRight, TrendingUp } from 'lucide-react';

export const HomePage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [selectedStatus, setSelectedStatus] = useState('ALL');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await eventAPI.getPublicEvents();
                if (res.data?.success && Array.isArray(res.data?.data)) {
                    setEvents(res.data.data);
                }
            } catch (err) {
                console.warn('Backend events fetch error:', err.message);
                setEvents([]);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const categories = ['ALL', 'TECH', 'WORKSHOP', 'HACKATHON', 'SEMINAR', 'SPORTS', 'CULTURAL'];

    const filteredEvents = events.filter((evt) => {
        const basicInfo = evt.basicInfo || {};
        const matchesSearch =
            basicInfo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            basicInfo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            basicInfo.category?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = selectedCategory === 'ALL' || basicInfo.category === selectedCategory;
        const matchesStatus = selectedStatus === 'ALL' || evt.status === selectedStatus;

        return matchesSearch && matchesCategory && matchesStatus;
    });

    return (
        <div className="space-y-16 pb-20">

            {/* Hero Section */}
            <section className="relative pt-12 pb-16 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-1/3 right-1/4 w-[400px] h-[250px] bg-violet-600/15 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">

                    {/* Top Pill Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6 shadow-sm">
                        <Zap className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                        <span>Next-Generation Event Registration Platform</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
                        Discover, Register & <span className="gradient-text">Host Iconic Events</span>
                    </h1>

                    <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
                        The complete end-to-end platform for attendees, tech conferences, hackathons, workshops, and verified organizers. Instant digital QR ticket generation.
                    </p>

                    {/* Platform Metrics Bar */}
                    <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                        <div className="p-4 rounded-2xl glass-card text-center border border-slate-800">
                            <span className="text-2xl sm:text-3xl font-extrabold text-white gradient-text">1,240+</span>
                            <p className="text-xs font-medium text-slate-400 mt-1">Events Hosted</p>
                        </div>
                        <div className="p-4 rounded-2xl glass-card text-center border border-slate-800">
                            <span className="text-2xl sm:text-3xl font-extrabold text-white gradient-text">48,500+</span>
                            <p className="text-xs font-medium text-slate-400 mt-1">Tickets Issued</p>
                        </div>
                        <div className="p-4 rounded-2xl glass-card text-center border border-slate-800">
                            <span className="text-2xl sm:text-3xl font-extrabold text-white gradient-text">99.9%</span>
                            <p className="text-xs font-medium text-slate-400 mt-1">Check-in Accuracy</p>
                        </div>
                        <div className="p-4 rounded-2xl glass-card text-center border border-slate-800">
                            <span className="text-2xl sm:text-3xl font-extrabold text-white gradient-text">350+</span>
                            <p className="text-xs font-medium text-slate-400 mt-1">Verified Organizers</p>
                        </div>
                    </div>

                </div>
            </section>

            {/* Main Search & Catalog Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

                {/* Search & Filter Header */}
                <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-6">

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="relative w-full md:w-96">
                            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                            <input
                                type="text"
                                placeholder="Search events by title, tag, or category..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-2xl glass-input text-xs sm:text-sm"
                            />
                        </div>

                        {/* Status Selector */}
                        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap mr-1">Status:</span>
                            <button
                                onClick={() => setSelectedStatus('ALL')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${selectedStatus === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                                    }`}
                            >
                                All Status
                            </button>
                            <button
                                onClick={() => setSelectedStatus('REGISTRATION_OPEN')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${selectedStatus === 'REGISTRATION_OPEN' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                                    }`}
                            >
                                Open Reg
                            </button>
                            <button
                                onClick={() => setSelectedStatus('PUBLISHED')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${selectedStatus === 'PUBLISHED' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                                    }`}
                            >
                                Upcoming
                            </button>
                        </div>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-800/80 scrollbar-none">
                        <span className="text-xs font-semibold text-slate-400 pr-2 shrink-0">Categories:</span>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-xs font-semibold transition shrink-0 ${selectedCategory === cat
                                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30'
                                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                </div>

                {/* Event Grid Section */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-400" />
                            <span>Explore Featured Events</span>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold">
                                {filteredEvents.length} Available
                            </span>
                        </h2>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-96 rounded-3xl bg-slate-900/60 animate-pulse border border-slate-800" />
                            ))}
                        </div>
                    ) : filteredEvents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredEvents.map((evt) => (
                                <EventCard key={evt._id} event={evt} />
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center rounded-3xl glass-card border border-slate-800">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                                <Search className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-white">No Events Found</h3>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                No events match your current search or category filter. Try clearing filters or searching for something else.
                            </p>
                            <button
                                onClick={() => { setSearchTerm(''); setSelectedCategory('ALL'); setSelectedStatus('ALL'); }}
                                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>

            </section>

        </div>
    );
};
