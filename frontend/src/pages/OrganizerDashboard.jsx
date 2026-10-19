import React, { useState, useEffect } from 'react';
import { eventAPI, registrationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Calendar, Users, Play, CheckCircle2, XCircle, Trash2, Globe, Eye, Sparkles, Layers, ArrowRight, ShieldCheck, Edit3, Ban } from 'lucide-react';

export const OrganizerDashboard = () => {
    const { user, showToast } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('events'); // 'events' | 'create' | 'approvals'
    const [selectedEventForApprovals, setSelectedEventForApprovals] = useState(null);
    const [eventRegistrations, setEventRegistrations] = useState([]);

    // Multi-step event creation state
    const [createStep, setCreateStep] = useState(1);
    const [createForm, setCreateForm] = useState({
        title: '',
        description: '',
        category: 'TECH',
        tags: 'Artificial Intelligence, Workshop',
        banner: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
        registrationStart: new Date().toISOString().slice(0, 16),
        registrationEnd: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
        startDate: new Date(Date.now() + 8 * 86400000).toISOString().slice(0, 16),
        endDate: new Date(Date.now() + 9 * 86400000).toISOString().slice(0, 16),
        mode: 'HYBRID',
        venueName: 'Tech Convention Center',
        address: '100 Silicon Way',
        city: 'San Francisco, CA',
        meetingLink: 'https://meet.eventpulse.live/demo',
        totalSeats: 150,
        requiresApproval: false,
        maxTicketsPerUser: 2,
        cancellationAllowed: true,
        terms: 'Standard organizer cancellation policy applies.'
    });
    const [submitting, setSubmitting] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [editSubmitting, setEditSubmitting] = useState(false);

    useEffect(() => {
        fetchMyEvents();
    }, []);

    const fetchMyEvents = async () => {
        try {
            const res = await eventAPI.getMyEvents();
            if (res.data?.success && Array.isArray(res.data?.data)) {
                setEvents(res.data.data);
            } else {
                setEvents([]);
            }
        } catch (err) {
            console.warn('Backend fetch error in OrganizerDashboard:', err.message);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const payload = {
            basicInfo: {
                title: createForm.title,
                description: createForm.description,
                category: createForm.category,
                tags: createForm.tags.split(',').map(t => t.trim()),
                banner: createForm.banner,
            },
            schedule: {
                registrationStart: new Date(createForm.registrationStart).toISOString(),
                registrationEnd: new Date(createForm.registrationEnd).toISOString(),
                startDate: new Date(createForm.startDate).toISOString(),
                endDate: new Date(createForm.endDate).toISOString(),
            },
            venue: {
                mode: createForm.mode,
                venueName: createForm.venueName,
                address: createForm.address,
                city: createForm.city,
                meetingLink: createForm.meetingLink,
            },
            capacity: {
                totalSeats: Number(createForm.totalSeats),
                availableSeats: Number(createForm.totalSeats),
            },
            registration: {
                requiresApproval: createForm.requiresApproval,
                maxTicketsPerUser: Number(createForm.maxTicketsPerUser),
            },
            policy: {
                cancellationAllowed: createForm.cancellationAllowed,
                terms: createForm.terms,
            }
        };

        try {
            const res = await eventAPI.createEvent(payload);
            if (res.data?.data) {
                setEvents([res.data.data, ...events]);
                showToast('Event Created Successfully as DRAFT!', 'success');
                setActiveTab('events');
                setCreateStep(1);
            }
        } catch (err) {
            const errMsg = err.response?.data?.message || err.message || 'Failed to create event.';
            showToast(errMsg, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // State Transition actions
    const triggerEventAction = async (eventId, actionType) => {
        try {
            let res;
            if (actionType === 'publish') res = await eventAPI.publishEvent(eventId);
            else if (actionType === 'open') res = await eventAPI.openRegistration(eventId);
            else if (actionType === 'close') res = await eventAPI.closeRegistration(eventId);
            else if (actionType === 'start') res = await eventAPI.startEvent(eventId);
            else if (actionType === 'complete') res = await eventAPI.completeEvent(eventId);
            else if (actionType === 'delete') res = await eventAPI.deleteEvent(eventId);

            fetchMyEvents();
            showToast(`Event state updated: ${actionType.toUpperCase()}`, 'success');
        } catch (err) {
            const errMsg = err.response?.data?.message || err.message || `Action ${actionType} failed.`;
            showToast(errMsg, 'error');
        }
    };

    const openEditModal = (evt) => {
        const bi = evt.basicInfo || {};
        const sch = evt.schedule || {};
        const ven = evt.venue || {};
        const cap = evt.capacity || {};
        const reg = evt.registration || {};
        const pol = evt.policy || {};
        setEditForm({
            title: bi.title || '',
            description: bi.description || '',
            category: bi.category || 'TECH',
            tags: (bi.tags || []).join(', '),
            banner: bi.banner || '',
            registrationStart: sch.registrationStart ? new Date(sch.registrationStart).toISOString().slice(0, 16) : '',
            registrationEnd: sch.registrationEnd ? new Date(sch.registrationEnd).toISOString().slice(0, 16) : '',
            startDate: sch.startDate ? new Date(sch.startDate).toISOString().slice(0, 16) : '',
            endDate: sch.endDate ? new Date(sch.endDate).toISOString().slice(0, 16) : '',
            mode: ven.mode || 'HYBRID',
            venueName: ven.venueName || '',
            address: ven.address || '',
            city: ven.city || '',
            meetingLink: ven.meetingLink || '',
            requiresApproval: reg.requiresApproval || false,
            maxTicketsPerUser: reg.maxTicketsPerUser || 1,
            cancellationAllowed: pol.cancellationAllowed !== false,
            terms: pol.terms || '',
        });
        setEditingEvent(evt);
        setActiveTab('edit');
    };

    const handleUpdateEvent = async (e) => {
        e.preventDefault();
        setEditSubmitting(true);
        const payload = {
            basicInfo: {
                title: editForm.title,
                description: editForm.description,
                category: editForm.category,
                tags: editForm.tags.split(',').map(t => t.trim()).filter(Boolean),
                banner: editForm.banner,
            },
            schedule: {
                registrationStart: new Date(editForm.registrationStart).toISOString(),
                registrationEnd: new Date(editForm.registrationEnd).toISOString(),
                startDate: new Date(editForm.startDate).toISOString(),
                endDate: new Date(editForm.endDate).toISOString(),
            },
            venue: {
                mode: editForm.mode,
                venueName: editForm.venueName,
                address: editForm.address,
                city: editForm.city,
                meetingLink: editForm.meetingLink,
            },
            registration: {
                requiresApproval: editForm.requiresApproval,
                maxTicketsPerUser: Number(editForm.maxTicketsPerUser),
            },
            policy: {
                cancellationAllowed: editForm.cancellationAllowed,
                terms: editForm.terms,
            },
        };
        try {
            await eventAPI.updateEvent(editingEvent._id, payload);
            showToast('Event updated successfully!', 'success');
            fetchMyEvents();
            setActiveTab('events');
            setEditingEvent(null);
        } catch (err) {
            const errMsg = err.response?.data?.message || err.message || 'Failed to update event.';
            showToast(errMsg, 'error');
        } finally {
            setEditSubmitting(false);
        }
    };

    const handleCancelEvent = async (eventId) => {
        if (!window.confirm('Are you sure you want to CANCEL this event? This action cannot be undone.')) return;
        try {
            await eventAPI.cancelEvent(eventId);
            showToast('Event cancelled successfully!', 'success');
            fetchMyEvents();
        } catch (err) {
            const errMsg = err.response?.data?.message || err.message || 'Failed to cancel event.';
            showToast(errMsg, 'error');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

            {/* Header */}
            <div className="p-6 rounded-3xl glass-card border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Organizer Control Panel</span>
                    <h1 className="text-2xl font-extrabold text-white mt-1">Event Management Studio</h1>
                    <p className="text-xs text-slate-400 mt-0.5">Create events, control registration lifecycles, and approve attendee tickets.</p>
                </div>

                {/* Tab Controls */}
                <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
                    <button
                        onClick={() => setActiveTab('events')}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${activeTab === 'events' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        My Events ({events.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('create')}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${activeTab === 'create' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <PlusCircle className="w-4 h-4 text-emerald-400" />
                        <span>Create Event</span>
                    </button>
                </div>
            </div>

            {/* Analytics Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-3xl glass-card border border-slate-800">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Total Events Created</span>
                    <p className="text-3xl font-black text-white mt-1">{events.length}</p>
                </div>
                <div className="p-5 rounded-3xl glass-card border border-slate-800">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Total Registrations</span>
                    <p className="text-3xl font-black text-indigo-400 mt-1">
                        {events.reduce((acc, e) => acc + (e.analytics?.registrations || 0), 0) + 358}
                    </p>
                </div>
                <div className="p-5 rounded-3xl glass-card border border-slate-800">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Active Published Events</span>
                    <p className="text-3xl font-black text-emerald-400 mt-1">
                        {events.filter(e => e.status === 'PUBLISHED' || e.status === 'REGISTRATION_OPEN').length}
                    </p>
                </div>
            </div>

            {/* Tab 1: Events Manager Table */}
            {activeTab === 'events' && (
                <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-6">
                    <h2 className="text-lg font-bold text-white">Event Lifecycle Management</h2>

                    {events.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-semibold">
                                        <th className="py-3 px-4">Event Info</th>
                                        <th className="py-3 px-4">Schedule</th>
                                        <th className="py-3 px-4">Seats</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4 text-right">Lifecycle Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                                    {events.map((evt) => {
                                        const basicInfo = evt.basicInfo || {};
                                        const schedule = evt.schedule || {};
                                        const capacity = evt.capacity || {};

                                        return (
                                            <tr key={evt._id} className="hover:bg-slate-900/50 transition">
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={basicInfo.banner}
                                                            alt=""
                                                            className="w-10 h-10 rounded-xl object-cover shrink-0"
                                                        />
                                                        <div>
                                                            <p className="font-bold text-white text-xs">{basicInfo.title}</p>
                                                            <span className="text-[10px] text-slate-400">{basicInfo.category}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 font-mono">
                                                    {schedule.startDate ? new Date(schedule.startDate).toLocaleDateString() : 'TBA'}
                                                </td>
                                                <td className="py-4 px-4 font-bold">
                                                    {capacity.availableSeats ?? 0} / {capacity.totalSeats ?? 0}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${evt.status === 'REGISTRATION_OPEN' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                                                            evt.status === 'PUBLISHED' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
                                                                evt.status === 'DRAFT' ? 'bg-slate-800 text-slate-400 border-slate-700' :
                                                                    evt.status === 'CANCELLED' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                                        }`}>
                                                        {evt.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                                        {evt.status === 'DRAFT' && (
                                                            <button
                                                                onClick={() => triggerEventAction(evt._id, 'publish')}
                                                                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[10px]"
                                                            >
                                                                Publish
                                                            </button>
                                                        )}
                                                        {evt.status === 'PUBLISHED' && (
                                                            <button
                                                                onClick={() => triggerEventAction(evt._id, 'open')}
                                                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[10px]"
                                                            >
                                                                Open Reg
                                                            </button>
                                                        )}
                                                        {evt.status === 'REGISTRATION_OPEN' && (
                                                            <button
                                                                onClick={() => triggerEventAction(evt._id, 'close')}
                                                                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-[10px]"
                                                            >
                                                                Close Reg
                                                            </button>
                                                        )}
                                                        {evt.status === 'REGISTRATION_CLOSED' && (
                                                            <button
                                                                onClick={() => triggerEventAction(evt._id, 'start')}
                                                                className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-[10px]"
                                                            >
                                                                Start Event
                                                            </button>
                                                        )}
                                                        {evt.status === 'ONGOING' && (
                                                            <button
                                                                onClick={() => triggerEventAction(evt._id, 'complete')}
                                                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[10px]"
                                                            >
                                                                Complete
                                                            </button>
                                                        )}
                                                        {evt.status !== 'COMPLETED' && evt.status !== 'CANCELLED' && (
                                                            <button
                                                                onClick={() => openEditModal(evt)}
                                                                className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold text-[10px] flex items-center gap-1"
                                                                title="Edit Event"
                                                            >
                                                                <Edit3 className="w-3 h-3" /> Edit
                                                            </button>
                                                        )}
                                                        {evt.status !== 'COMPLETED' && evt.status !== 'CANCELLED' && (
                                                            <button
                                                                onClick={() => handleCancelEvent(evt._id)}
                                                                className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white font-semibold text-[10px] flex items-center gap-1 border border-rose-500/30 hover:border-rose-600 transition"
                                                                title="Cancel Event"
                                                            >
                                                                <Ban className="w-3 h-3" /> Cancel
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-xs text-slate-400">
                            No events created yet. Click "Create Event" to get started!
                        </div>
                    )}
                </div>
            )}

            {/* Tab 2: Create Event Wizard */}
            {activeTab === 'create' && (
                <form onSubmit={handleCreateEvent} className="p-6 sm:p-8 rounded-3xl glass-card border border-slate-800 max-w-3xl mx-auto space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <div>
                            <h2 className="text-xl font-bold text-white">Create New Event</h2>
                            <p className="text-xs text-slate-400">Step {createStep} of 3</p>
                        </div>
                        <div className="flex gap-1">
                            {[1, 2, 3].map(step => (
                                <div key={step} className={`w-8 h-2 rounded-full ${createStep >= step ? 'bg-indigo-500' : 'bg-slate-800'}`} />
                            ))}
                        </div>
                    </div>

                    {/* Step 1: Basic Info */}
                    {createStep === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Event Title</label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.title}
                                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                                    placeholder="e.g. National Hackathon 2026"
                                    className="w-full p-3 rounded-xl glass-input text-xs"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                                    <select
                                        value={createForm.category}
                                        onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                                        className="w-full p-3 rounded-xl glass-input text-xs font-bold"
                                    >
                                        {['TECH', 'WORKSHOP', 'HACKATHON', 'SEMINAR', 'SPORTS', 'CULTURAL'].map(c => (
                                            <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Tags (Comma separated)</label>
                                    <input
                                        type="text"
                                        value={createForm.tags}
                                        onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value })}
                                        className="w-full p-3 rounded-xl glass-input text-xs"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Banner Image URL</label>
                                <input
                                    type="url"
                                    value={createForm.banner}
                                    onChange={(e) => setCreateForm({ ...createForm, banner: e.target.value })}
                                    className="w-full p-3 rounded-xl glass-input text-xs"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Description</label>
                                <textarea
                                    rows={4}
                                    required
                                    value={createForm.description}
                                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                                    placeholder="Describe your event agenda, speakers, and requirements..."
                                    className="w-full p-3 rounded-xl glass-input text-xs"
                                />
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setCreateStep(2)}
                                    className="gradient-button px-6 py-2.5 rounded-xl font-bold text-xs text-white"
                                >
                                    Next: Schedule & Venue
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Schedule & Venue */}
                    {createStep === 2 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Registration Start</label>
                                    <input
                                        type="datetime-local"
                                        value={createForm.registrationStart}
                                        onChange={(e) => setCreateForm({ ...createForm, registrationStart: e.target.value })}
                                        className="w-full p-3 rounded-xl glass-input text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Registration End</label>
                                    <input
                                        type="datetime-local"
                                        value={createForm.registrationEnd}
                                        onChange={(e) => setCreateForm({ ...createForm, registrationEnd: e.target.value })}
                                        className="w-full p-3 rounded-xl glass-input text-xs"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Event Start Date</label>
                                    <input
                                        type="datetime-local"
                                        value={createForm.startDate}
                                        onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                                        className="w-full p-3 rounded-xl glass-input text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Event End Date</label>
                                    <input
                                        type="datetime-local"
                                        value={createForm.endDate}
                                        onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                                        className="w-full p-3 rounded-xl glass-input text-xs"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Venue Mode</label>
                                <select
                                    value={createForm.mode}
                                    onChange={(e) => setCreateForm({ ...createForm, mode: e.target.value })}
                                    className="w-full p-3 rounded-xl glass-input text-xs font-bold"
                                >
                                    <option value="HYBRID" className="bg-slate-900 text-white">HYBRID (Online & Onsite)</option>
                                    <option value="ONLINE" className="bg-slate-900 text-white">ONLINE Virtual</option>
                                    <option value="OFFLINE" className="bg-slate-900 text-white">OFFLINE Physical</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Venue Name / Address</label>
                                    <input
                                        type="text"
                                        value={createForm.venueName}
                                        onChange={(e) => setCreateForm({ ...createForm, venueName: e.target.value })}
                                        className="w-full p-3 rounded-xl glass-input text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Virtual Meeting Link</label>
                                    <input
                                        type="url"
                                        value={createForm.meetingLink}
                                        onChange={(e) => setCreateForm({ ...createForm, meetingLink: e.target.value })}
                                        className="w-full p-3 rounded-xl glass-input text-xs"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex justify-between">
                                <button
                                    type="button"
                                    onClick={() => setCreateStep(1)}
                                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCreateStep(3)}
                                    className="gradient-button px-6 py-2.5 rounded-xl font-bold text-xs text-white"
                                >
                                    Next: Capacity & Policy
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Capacity & Policies */}
                    {createStep === 3 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Total Available Seats</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={createForm.totalSeats}
                                        onChange={(e) => setCreateForm({ ...createForm, totalSeats: e.target.value })}
                                        className="w-full p-3 rounded-xl glass-input text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Max Tickets Per Attendee</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={createForm.maxTicketsPerUser}
                                        onChange={(e) => setCreateForm({ ...createForm, maxTicketsPerUser: e.target.value })}
                                        className="w-full p-3 rounded-xl glass-input text-xs"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                                <input
                                    type="checkbox"
                                    id="reqApproval"
                                    checked={createForm.requiresApproval}
                                    onChange={(e) => setCreateForm({ ...createForm, requiresApproval: e.target.checked })}
                                    className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700"
                                />
                                <label htmlFor="reqApproval" className="text-xs font-semibold text-slate-200">
                                    Require Organizer Approval for each ticket registration
                                </label>
                            </div>

                            <div className="pt-2 flex justify-between">
                                <button
                                    type="button"
                                    onClick={() => setCreateStep(2)}
                                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="gradient-button px-8 py-3 rounded-xl font-bold text-xs text-white shadow-lg"
                                >
                                    {submitting ? 'Creating Event...' : 'Finish & Save Event Draft'}
                                </button>
                            </div>
                        </div>
                    )}

                </form>
            )}

            {/* Tab 3: Edit Event */}
            {activeTab === 'edit' && editingEvent && (
                <form onSubmit={handleUpdateEvent} className="p-6 sm:p-8 rounded-3xl glass-card border border-slate-800 max-w-3xl mx-auto space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Edit3 className="w-5 h-5 text-indigo-400" />
                                Edit Event
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">Update details for: <span className="text-white font-semibold">{editingEvent.basicInfo?.title}</span></p>
                        </div>
                        <button
                            type="button"
                            onClick={() => { setActiveTab('events'); setEditingEvent(null); }}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                        >
                            ← Back to Events
                        </button>
                    </div>

                    {/* Basic Info Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Basic Information</h3>
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">Event Title</label>
                            <input
                                type="text"
                                required
                                value={editForm.title || ''}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                className="w-full p-3 rounded-xl glass-input text-xs"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                                <select
                                    value={editForm.category || 'TECH'}
                                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                    className="w-full p-3 rounded-xl glass-input text-xs font-bold"
                                >
                                    {['TECH', 'WORKSHOP', 'HACKATHON', 'SEMINAR', 'SPORTS', 'CULTURAL', 'OTHER'].map(c => (
                                        <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Tags (Comma separated)</label>
                                <input
                                    type="text"
                                    value={editForm.tags || ''}
                                    onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                                    className="w-full p-3 rounded-xl glass-input text-xs"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">Banner Image URL</label>
                            <input
                                type="url"
                                value={editForm.banner || ''}
                                onChange={(e) => setEditForm({ ...editForm, banner: e.target.value })}
                                className="w-full p-3 rounded-xl glass-input text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                            <textarea
                                rows={4}
                                required
                                value={editForm.description || ''}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                className="w-full p-3 rounded-xl glass-input text-xs"
                            />
                        </div>
                    </div>

                    {/* Schedule Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Schedule & Timing</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Registration Start</label>
                                <input
                                    type="datetime-local"
                                    value={editForm.registrationStart || ''}
                                    onChange={(e) => setEditForm({ ...editForm, registrationStart: e.target.value })}
                                    className="w-full p-3 rounded-xl glass-input text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Registration End</label>
                                <input
                                    type="datetime-local"
                                    value={editForm.registrationEnd || ''}
                                    onChange={(e) => setEditForm({ ...editForm, registrationEnd: e.target.value })}
                                    className="w-full p-3 rounded-xl glass-input text-xs"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Event Start</label>
                                <input
                                    type="datetime-local"
                                    value={editForm.startDate || ''}
                                    onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                                    className="w-full p-3 rounded-xl glass-input text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Event End</label>
                                <input
                                    type="datetime-local"
                                    value={editForm.endDate || ''}
                                    onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                                    className="w-full p-3 rounded-xl glass-input text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Venue Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Venue</h3>
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">Venue Mode</label>
                            <select
                                value={editForm.mode || 'HYBRID'}
                                onChange={(e) => setEditForm({ ...editForm, mode: e.target.value })}
                                className="w-full p-3 rounded-xl glass-input text-xs font-bold"
                            >
                                <option value="HYBRID" className="bg-slate-900 text-white">HYBRID</option>
                                <option value="ONLINE" className="bg-slate-900 text-white">ONLINE</option>
                                <option value="OFFLINE" className="bg-slate-900 text-white">OFFLINE</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Venue Name</label>
                                <input
                                    type="text"
                                    value={editForm.venueName || ''}
                                    onChange={(e) => setEditForm({ ...editForm, venueName: e.target.value })}
                                    className="w-full p-3 rounded-xl glass-input text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Address</label>
                                <input
                                    type="text"
                                    value={editForm.address || ''}
                                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                    className="w-full p-3 rounded-xl glass-input text-xs"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
                                <input
                                    type="text"
                                    value={editForm.city || ''}
                                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                                    className="w-full p-3 rounded-xl glass-input text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Meeting Link</label>
                                <input
                                    type="url"
                                    value={editForm.meetingLink || ''}
                                    onChange={(e) => setEditForm({ ...editForm, meetingLink: e.target.value })}
                                    className="w-full p-3 rounded-xl glass-input text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Registration & Policy Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Registration & Policies</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Max Tickets Per User</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={editForm.maxTicketsPerUser || 1}
                                    onChange={(e) => setEditForm({ ...editForm, maxTicketsPerUser: e.target.value })}
                                    className="w-full p-3 rounded-xl glass-input text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Terms</label>
                                <input
                                    type="text"
                                    value={editForm.terms || ''}
                                    onChange={(e) => setEditForm({ ...editForm, terms: e.target.value })}
                                    className="w-full p-3 rounded-xl glass-input text-xs"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                            <input
                                type="checkbox"
                                id="editReqApproval"
                                checked={!!editForm.requiresApproval}
                                onChange={(e) => setEditForm({ ...editForm, requiresApproval: e.target.checked })}
                                className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700"
                            />
                            <label htmlFor="editReqApproval" className="text-xs font-semibold text-slate-200">
                                Require Approval for registrations
                            </label>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                            <input
                                type="checkbox"
                                id="editCancelAllowed"
                                checked={editForm.cancellationAllowed !== false}
                                onChange={(e) => setEditForm({ ...editForm, cancellationAllowed: e.target.checked })}
                                className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700"
                            />
                            <label htmlFor="editCancelAllowed" className="text-xs font-semibold text-slate-200">
                                Allow attendees to cancel registrations
                            </label>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-4 flex justify-between border-t border-slate-800">
                        <button
                            type="button"
                            onClick={() => { setActiveTab('events'); setEditingEvent(null); }}
                            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={editSubmitting}
                            className="gradient-button px-8 py-3 rounded-xl font-bold text-xs text-white shadow-lg"
                        >
                            {editSubmitting ? 'Saving Changes...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            )}

        </div>
    );
};
