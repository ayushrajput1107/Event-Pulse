import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Ticket, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const EventCard = ({ event }) => {
    if (!event) return null;

    const basicInfo = event.basicInfo || {};
    const schedule = event.schedule || {};
    const venue = event.venue || {};
    const capacity = event.capacity || {};

    const statusColors = {
        REGISTRATION_OPEN: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        PUBLISHED: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
        REGISTRATION_CLOSED: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        ONGOING: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        COMPLETED: 'bg-slate-700/50 text-slate-400 border-slate-600/30',
        CANCELLED: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    };

    const statusLabels = {
        REGISTRATION_OPEN: 'Open for Registration',
        PUBLISHED: 'Upcoming Event',
        REGISTRATION_CLOSED: 'Registration Closed',
        ONGOING: 'Live Event',
        COMPLETED: 'Finished',
        CANCELLED: 'Cancelled',
    };

    const seatsPercent = Math.max(0, Math.min(100, Math.round(((capacity.totalSeats - capacity.availableSeats) / (capacity.totalSeats || 1)) * 100)));

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Date TBA';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className="group glass-card glass-card-hover rounded-3xl overflow-hidden flex flex-col h-full border border-slate-800">

            {/* Banner & Badges */}
            <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                <img
                    src={basicInfo.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}
                    alt={basicInfo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider bg-slate-950/80 backdrop-blur-md text-indigo-300 border border-slate-800 uppercase">
                        {basicInfo.category || 'EVENT'}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md ${statusColors[event.status] || statusColors.PUBLISHED}`}>
                        {statusLabels[event.status] || event.status}
                    </span>
                </div>

                {/* Date Overlay */}
                <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-xs font-semibold text-white drop-shadow">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span>{formatDate(schedule.startDate)}</span>
                </div>
            </div>

            {/* Content Body */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                        {basicInfo.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {basicInfo.description}
                    </p>
                </div>

                {/* Info Grid */}
                <div className="space-y-3 pt-2 border-t border-slate-800/80">

                    {/* Location / Mode */}
                    <div className="flex items-center text-xs text-slate-300 gap-2">
                        <MapPin className="w-4 h-4 text-violet-400 shrink-0" />
                        <span className="truncate">
                            {venue.mode === 'ONLINE' ? 'Virtual Online Event' : venue.venueName || venue.city || 'In-Person Venue'}
                        </span>
                    </div>

                    {/* Seat Progress */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
                            <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Seats Availability</span>
                            </span>
                            <span className="font-bold text-slate-200">
                                {capacity.availableSeats ?? 0} / {capacity.totalSeats ?? 0} Left
                            </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                                style={{ width: `${seatsPercent}%` }}
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    {basicInfo.tags && basicInfo.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {basicInfo.tags.slice(0, 3).map((tag, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-900 text-slate-400 border border-slate-800">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                </div>

                {/* Footer Action */}
                <div className="pt-2">
                    <Link
                        to={`/event/${event._id}`}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-indigo-600 text-slate-200 hover:text-white border border-slate-800 hover:border-indigo-500 flex items-center justify-center gap-2 transition-all shadow-sm group-hover:shadow-indigo-600/20"
                    >
                        <span>View Event & Register</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

            </div>

        </div>
    );
};
