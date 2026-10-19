import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventAPI, registrationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { QRTicketModal } from '../components/QRTicketModal';
import confetti from 'canvas-confetti';
import { Calendar, MapPin, Users, ShieldCheck, Ticket, ArrowLeft, CheckCircle, AlertTriangle, ExternalLink, Clock } from 'lucide-react';

export const EventDetailsPage = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { user, openAuthModal, showToast } = useAuth();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ticketCount, setTicketCount] = useState(1);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [activeRegistration, setActiveRegistration] = useState(null);
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await eventAPI.getEventById(eventId);
                if (res.data?.success && res.data?.data) {
                    setEvent(res.data.data);
                }
            } catch (err) {
                console.warn('Backend event fetch error:', err.message);
                setEvent(null);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [eventId]);

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-20 text-center">
                <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400 mt-4">Loading event specs...</p>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
                <h2 className="text-2xl font-bold text-white">Event Not Found</h2>
                <p className="text-xs text-slate-400">The event you are looking for does not exist or has been removed.</p>
                <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold">
                    <ArrowLeft className="w-4 h-4" /> Return to Events Catalog
                </Link>
            </div>
        );
    }

    const basicInfo = event.basicInfo || {};
    const schedule = event.schedule || {};
    const venue = event.venue || {};
    const capacity = event.capacity || {};
    const registrationPolicy = event.registration || {};
    const policy = event.policy || {};
    const organizer = event.organizer || {};

    const isRegistrationOpen = event.status === 'REGISTRATION_OPEN';

    const formatDate = (dateStr) => {
        if (!dateStr) return 'TBA';
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleBookTicket = async () => {
        if (!user) {
            openAuthModal('login');
            return;
        }

        setBookingLoading(true);
        try {
            const res = await registrationAPI.register(event._id, ticketCount);
            if (res.data?.success && res.data?.data) {
                const regObj = res.data.data;
                setActiveRegistration({
                    ...regObj,
                    event: event,
                });
                showToast('Ticket Registered Successfully!', 'success');
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                setIsTicketModalOpen(true);
            }
        } catch (err) {
            const errMsg = err.response?.data?.message || err.message || 'Ticket booking failed.';
            showToast(errMsg, 'error');
        } finally {
            setBookingLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

            {/* Back Button */}
            <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition">
                <ArrowLeft className="w-4 h-4" /> Back to Event Discovery
            </Link>

            {/* Hero Media Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl h-80 sm:h-96">
                <img
                    src={basicInfo.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'}
                    alt={basicInfo.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

                <div className="absolute bottom-6 left-6 right-6 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white uppercase shadow">
                            {basicInfo.category}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900/80 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                            {event.status?.replace('_', ' ')}
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight drop-shadow-md">
                        {basicInfo.title}
                    </h1>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left 2 Columns: Description, Schedule, Venue, Policies */}
                <div className="lg:col-span-2 space-y-8">

                    {/* About Event */}
                    <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Ticket className="w-5 h-5 text-indigo-400" />
                            <span>About This Event</span>
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                            {basicInfo.description}
                        </p>
                    </div>

                    {/* Schedule & Timing */}
                    <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-indigo-400" />
                            <span>Event Schedule & Deadlines</span>
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                                <span className="text-[11px] font-semibold text-slate-400 uppercase block">Event Start Date</span>
                                <p className="text-xs font-bold text-white">{formatDate(schedule.startDate)}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                                <span className="text-[11px] font-semibold text-slate-400 uppercase block">Event End Date</span>
                                <p className="text-xs font-bold text-white">{formatDate(schedule.endDate)}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                                <span className="text-[11px] font-semibold text-slate-400 uppercase block">Registration Start</span>
                                <p className="text-xs font-bold text-slate-300">{formatDate(schedule.registrationStart)}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                                <span className="text-[11px] font-semibold text-slate-400 uppercase block">Registration Deadline</span>
                                <p className="text-xs font-bold text-slate-300">{formatDate(schedule.registrationEnd)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Location & Venue */}
                    <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-violet-400" />
                            <span>Venue & Location</span>
                        </h2>
                        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-indigo-400 uppercase">MODE: {venue.mode}</span>
                                {venue.meetingLink && (
                                    <a
                                        href={venue.meetingLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-violet-400 hover:underline"
                                    >
                                        Join Link <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                            </div>
                            {venue.venueName && <p className="text-sm font-bold text-white">{venue.venueName}</p>}
                            {venue.address && <p className="text-xs text-slate-400">{venue.address}, {venue.city}</p>}
                        </div>
                    </div>

                    {/* Organizer Info */}
                    <div className="p-6 rounded-3xl glass-card border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white text-lg shadow-lg">
                                {organizer.profile?.firstName?.[0] || 'O'}
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-semibold uppercase">Organized By</p>
                                <h3 className="text-sm font-bold text-white">
                                    {organizer.profile?.firstName ? `${organizer.profile.firstName} ${organizer.profile.lastName}` : 'Verified Event Team'}
                                </h3>
                                <p className="text-[11px] text-slate-400">{organizer.auth?.email || 'verified.organizer@eventpulse.io'}</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Verified Organizer
                        </span>
                    </div>

                </div>

                {/* Right 1 Column: Ticket Booking Panel */}
                <div className="space-y-6">

                    <div className="sticky top-24 p-6 rounded-3xl glass-card border border-slate-800 space-y-6 shadow-2xl">

                        <div className="border-b border-slate-800 pb-4">
                            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">Access Pass</span>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-3xl font-black text-white">FREE</span>
                                <span className="text-xs text-slate-400 font-medium">/ Registration Ticket</span>
                            </div>
                        </div>

                        {/* Capacity Status */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs font-semibold">
                                <span className="text-slate-400">Available Seats:</span>
                                <span className="text-emerald-400">{capacity.availableSeats ?? 0} Remaining</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                                    style={{ width: `${Math.max(10, ((capacity.availableSeats || 1) / (capacity.totalSeats || 1)) * 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Quantity Selector */}
                        {isRegistrationOpen && (
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-300 block">Number of Tickets</label>
                                <select
                                    value={ticketCount}
                                    onChange={(e) => setTicketCount(Number(e.target.value))}
                                    className="w-full p-3 rounded-xl glass-input text-xs font-bold"
                                >
                                    {Array.from({ length: registrationPolicy.maxTicketsPerUser || 1 }, (_, i) => i + 1).map((n) => (
                                        <option key={n} value={n} className="bg-slate-900 text-white">
                                            {n} {n === 1 ? 'Ticket' : 'Tickets'}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-slate-400">
                                    Max limit per attendee: {registrationPolicy.maxTicketsPerUser || 1}
                                </p>
                            </div>
                        )}

                        {/* Booking Action */}
                        {isRegistrationOpen ? (
                            <button
                                onClick={handleBookTicket}
                                disabled={bookingLoading}
                                className="w-full gradient-button py-3.5 rounded-xl font-bold text-xs text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                            >
                                {bookingLoading ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Ticket className="w-4 h-4" />
                                        <span>Confirm Ticket Registration</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-medium text-center">
                                Registration is currently {event.status?.replace('_', ' ').toLowerCase()}.
                            </div>
                        )}

                        {/* Policy Badges */}
                        <div className="pt-4 border-t border-slate-800 space-y-2 text-[11px] text-slate-400">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>Instant QR Digital Pass Generation</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                <span>{policy.cancellationAllowed ? 'Cancellation Allowed' : 'Non-cancellable ticket'}</span>
                            </div>
                        </div>

                    </div>

                </div>

            </div>

            {/* QR Ticket Modal */}
            <QRTicketModal
                isOpen={isTicketModalOpen}
                onClose={() => setIsTicketModalOpen(false)}
                registration={activeRegistration}
                event={event}
            />

        </div>
    );
};
