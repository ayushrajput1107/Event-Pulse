import React, { useState, useEffect } from 'react';
import { registrationAPI, organizerApplicationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { QRTicketModal } from '../components/QRTicketModal';
import {
    Ticket, Calendar, MapPin, QrCode, XCircle, PlusCircle, CheckCircle, Clock,
    ShieldAlert, FileText, Send, Building, Globe, Linkedin, Github, Link2,
    BadgeCheck, Award, Users, ChevronRight, Info, Upload
} from 'lucide-react';

// Step Indicator Component
const StepIndicator = ({ steps, currentStep }) => (
    <div className="flex items-center gap-0 mb-8">
        {steps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;
            return (
                <React.Fragment key={step.label}>
                    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                            isCompleted
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : isActive
                                ? 'bg-slate-900 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-500/30'
                                : 'bg-slate-900 border-slate-700 text-slate-500'
                        }`}>
                            {isCompleted ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                        </div>
                        <span className={`text-[10px] font-semibold uppercase tracking-wide ${isActive ? 'text-indigo-400' : isCompleted ? 'text-slate-300' : 'text-slate-600'}`}>
                            {step.label}
                        </span>
                    </div>
                    {idx < steps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-all duration-500 ${isCompleted ? 'bg-indigo-600' : 'bg-slate-800'}`} />
                    )}
                </React.Fragment>
            );
        })}
    </div>
);

// Social Link Input Row
const SocialLinkInput = ({ icon: Icon, label, placeholder, value, onChange, accentColor = 'indigo', prefix = '' }) => (
    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 focus-within:border-indigo-500 focus-within:shadow-lg focus-within:shadow-indigo-500/10 transition-all duration-200 group">
        <div className={`w-9 h-9 rounded-lg bg-${accentColor}-500/10 flex items-center justify-center shrink-0 group-focus-within:bg-${accentColor}-500/20 transition-colors`}>
            <Icon className={`w-4 h-4 text-${accentColor}-400`} />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-0.5">{label}</span>
            <input
                type="url"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="bg-transparent border-none outline-none text-sm text-slate-200 placeholder:text-slate-600 w-full"
            />
        </div>
    </div>
);

export const AttendeeDashboard = () => {
    const { user, showToast } = useAuth();
    const [registrations, setRegistrations] = useState([]);
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' | 'organizer-app'
    const [selectedRegistration, setSelectedRegistration] = useState(null);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [ticketFilter, setTicketFilter] = useState('all'); // 'all' | 'confirmed' | 'pending'

    // Multi-step form state
    const [formStep, setFormStep] = useState(0);

    // Application form state
    const [appForm, setAppForm] = useState({
        // Step 0 — Organization Info
        orgName: '',
        orgWebsite: '',
        orgDescription: '',
        // Step 1 — Experience
        totalEvents: 0,
        largestAudience: 0,
        experienceDesc: '',
        // Step 2 — Social Links
        linkedin: '',
        github: '',
        portfolio: '',
        // Step 3 — Document
        documentType: 'COLLEGE_ID',
        documentUrl: '',
    });
    const [appSubmitting, setAppSubmitting] = useState(false);

    const FORM_STEPS = [
        { label: 'Organization' },
        { label: 'Experience' },
        { label: 'Social Links' },
        { label: 'Documents' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [regRes, appRes] = await Promise.allSettled([
                    registrationAPI.getMyRegistrations(),
                    organizerApplicationAPI.getMyApplication(),
                ]);

                if (regRes.status === 'fulfilled' && regRes.value.data?.data) {
                    const data = regRes.value.data.data;
                    setRegistrations(Array.isArray(data) ? data : [data]);
                } else {
                    setRegistrations([]);
                }

                if (appRes.status === 'fulfilled' && appRes.value.data?.data) {
                    setApplication(appRes.value.data.data);
                } else {
                    setApplication(null);
                }
            } catch (err) {
                console.warn('Backend fetch error in AttendeeDashboard:', err.message);
                setRegistrations([]);
                setApplication(null);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCancelRegistration = async (regId) => {
        if (!window.confirm('Are you sure you want to cancel this ticket registration?')) return;

        try {
            await registrationAPI.cancelRegistration(regId);
            setRegistrations(registrations.map(r => r._id === regId ? { ...r, status: 'CANCELLED' } : r));
            showToast('Registration cancelled', 'info');
        } catch (err) {
            const errMsg = err.response?.data?.message || err.message || 'Failed to cancel registration';
            showToast(errMsg, 'error');
        }
    };

    const handleApplyOrganizer = async (e) => {
        e.preventDefault();
        setAppSubmitting(true);

        const payload = {
            organization: {
                name: appForm.orgName,
                website: appForm.orgWebsite || null,
                description: appForm.orgDescription,
            },
            eventExperience: {
                totalEventsHosted: Number(appForm.totalEvents),
                largestAudience: Number(appForm.largestAudience),
                experienceDescription: appForm.experienceDesc,
            },
            socialLinks: {
                linkedin: appForm.linkedin || null,
                github: appForm.github || null,
                portfolio: appForm.portfolio || null,
            },
            documents: [
                {
                    documentType: appForm.documentType,
                    documentUrl: appForm.documentUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80'
                }
            ]
        };

        try {
            const res = await organizerApplicationAPI.apply(payload);
            if (res.data?.data) {
                setApplication(res.data.data);
                showToast('Organizer application submitted for Admin review!', 'success');
            }
        } catch (err) {
            const errMsg = err.response?.data?.message || err.message || 'Application submission failed.';
            showToast(errMsg, 'error');
        } finally {
            setAppSubmitting(false);
        }
    };

    const updateForm = (field, value) => setAppForm(prev => ({ ...prev, [field]: value }));

    const canProceedStep0 = appForm.orgName.trim() && appForm.orgDescription.trim();
    const canProceedStep1 = appForm.experienceDesc.trim();
    const canProceedStep3 = appForm.documentUrl.trim();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

            {/* Dashboard Header */}
            <div className="p-6 rounded-3xl glass-card border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Attendee Dashboard</span>
                    <h1 className="text-2xl font-extrabold text-white mt-1">
                        Welcome back, {user?.profile?.firstName || 'Attendee'}!
                    </h1>
                    <p className="text-xs text-slate-400 mt-0.5">Manage your digital ticket passes and organizer application status.</p>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto">
                    <button
                        onClick={() => setActiveTab('tickets')}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${activeTab === 'tickets' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <Ticket className="w-4 h-4" />
                        <span>My Tickets ({registrations.length})</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('organizer-app')}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${activeTab === 'organizer-app' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <Building className="w-4 h-4" />
                        <span>Become Organizer</span>
                    </button>
                </div>
            </div>

            {/* Tab 1: My Registered Tickets */}
            {activeTab === 'tickets' && (() => {
                const pendingCount = registrations.filter(r => r.status === 'PENDING').length;
                const confirmedCount = registrations.filter(r => r.status === 'CONFIRMED').length;

                const filteredRegistrations = registrations.filter(reg => {
                    if (ticketFilter === 'confirmed') return reg.status === 'CONFIRMED';
                    if (ticketFilter === 'pending') return reg.status === 'PENDING';
                    return true;
                });

                return (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Ticket className="w-5 h-5 text-indigo-400" />
                                <span>Active Registrations &amp; Digital Passes</span>
                            </h2>

                            {/* Ticket Filter Pills */}
                            <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 self-start sm:self-auto text-xs">
                                <button
                                    onClick={() => setTicketFilter('all')}
                                    className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                                        ticketFilter === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    All ({registrations.length})
                                </button>
                                <button
                                    onClick={() => setTicketFilter('confirmed')}
                                    className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 ${
                                        ticketFilter === 'confirmed' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-emerald-300'
                                    }`}
                                >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    <span>Confirmed ({confirmedCount})</span>
                                </button>
                                <button
                                    onClick={() => setTicketFilter('pending')}
                                    className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 ${
                                        ticketFilter === 'pending' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-amber-300'
                                    }`}
                                >
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>Waiting ({pendingCount})</span>
                                </button>
                            </div>
                        </div>

                        {filteredRegistrations.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredRegistrations.map((reg) => {
                                    const event = reg.event || {};
                                    const basicInfo = event.basicInfo || {};
                                    const schedule = event.schedule || {};
                                    const isConfirmed = reg.status === 'CONFIRMED';
                                    const isPending = reg.status === 'PENDING';
                                    const isRejected = reg.status === 'REJECTED';

                                    return (
                                        <div key={reg._id} className="glass-card glass-card-hover rounded-3xl p-6 border border-slate-800 space-y-4 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                                                        {basicInfo.category || 'EVENT'}
                                                    </span>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border ${
                                                        isConfirmed
                                                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                                            : isPending
                                                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                                            : isRejected
                                                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                                            : 'bg-slate-800 text-slate-400 border-slate-700'
                                                    }`}>
                                                        {isConfirmed && <CheckCircle className="w-3 h-3" />}
                                                        {isPending && <Clock className="w-3 h-3 animate-pulse" />}
                                                        {isRejected && <XCircle className="w-3 h-3" />}
                                                        <span>{isPending ? 'WAITING FOR APPROVAL' : reg.status}</span>
                                                    </span>
                                                </div>

                                                <h3 className="text-base font-bold text-white line-clamp-2">{basicInfo.title || 'Event Title'}</h3>

                                                <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                                                        <span>{schedule.startDate ? new Date(schedule.startDate).toLocaleDateString() : 'TBA'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Ticket className="w-3.5 h-3.5 text-violet-400" />
                                                        <span>{reg.ticketCount} Ticket(s) Reserved</span>
                                                    </div>
                                                </div>

                                                {/* Notice for Pending registrations */}
                                                {isPending && (
                                                    <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2">
                                                        <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400 animate-pulse" />
                                                        <span>
                                                            <strong>Entry Pending:</strong> Waiting for organizer approval. QR pass will be unlocked and visible once confirmed.
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Review notes for Rejected registrations */}
                                                {isRejected && reg.reviewNotes && (
                                                    <div className="mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300">
                                                        <span className="font-bold block">Organizer Note:</span> {reg.reviewNotes}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2">
                                                {isConfirmed ? (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRegistration(reg);
                                                            setIsQRModalOpen(true);
                                                        }}
                                                        className="flex-1 gradient-button py-2.5 px-3 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.02] transition"
                                                    >
                                                        <QrCode className="w-4 h-4" />
                                                        <span>View Digital Pass</span>
                                                    </button>
                                                ) : isPending ? (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRegistration(reg);
                                                            setIsQRModalOpen(true);
                                                        }}
                                                        className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 transition flex items-center justify-center gap-1.5"
                                                        title="Click to check registration status"
                                                    >
                                                        <Clock className="w-4 h-4 animate-pulse" />
                                                        <span>Waiting for Approval</span>
                                                    </button>
                                                ) : isRejected ? (
                                                    <div className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-400 text-center border border-rose-500/20">
                                                        Entry Rejected
                                                    </div>
                                                ) : (
                                                    <div className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold bg-slate-800 text-slate-400 text-center">
                                                        Cancelled
                                                    </div>
                                                )}

                                                {reg.status !== 'CANCELLED' && !isRejected && (
                                                    <button
                                                        onClick={() => handleCancelRegistration(reg._id)}
                                                        className="p-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-800 transition"
                                                        title="Cancel Registration"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-12 text-center rounded-3xl glass-card border border-slate-800">
                                <Ticket className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                                <h3 className="text-base font-bold text-white">No Tickets Found</h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    {ticketFilter === 'all'
                                        ? "You haven't registered for any events yet."
                                        : `No ${ticketFilter} registrations found.`}
                                </p>
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* Tab 2: Organizer Application Form / Status */}
            {activeTab === 'organizer-app' && (
                <div className="max-w-3xl mx-auto space-y-8">

                    {/* Current Application Status Card */}
                    {application ? (
                        <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Application Status</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${application.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                                        application.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                    }`}>
                                    {application.status}
                                </span>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-white">{application.organization?.name}</h3>
                                {application.organization?.website && (
                                    <a href={application.organization.website} target="_blank" rel="noreferrer"
                                        className="text-xs text-indigo-400 hover:underline flex items-center gap-1 mt-0.5">
                                        <Globe className="w-3 h-3" /> {application.organization.website}
                                    </a>
                                )}
                                <p className="text-xs text-slate-300 mt-2">{application.organization?.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                                <div>
                                    <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wide">Hosted Events</span>
                                    <span className="font-bold text-white text-sm">{application.eventExperience?.totalEventsHosted || 0} Events</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wide">Largest Audience</span>
                                    <span className="font-bold text-white text-sm">{application.eventExperience?.largestAudience || 0} Attendees</span>
                                </div>
                            </div>

                            {/* Social Links in Status view */}
                            {(application.socialLinks?.linkedin || application.socialLinks?.github || application.socialLinks?.portfolio) && (
                                <div className="flex flex-wrap gap-2">
                                    {application.socialLinks?.linkedin && (
                                        <a href={application.socialLinks.linkedin} target="_blank" rel="noreferrer"
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition border border-blue-500/20">
                                            <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                                        </a>
                                    )}
                                    {application.socialLinks?.github && (
                                        <a href={application.socialLinks.github} target="_blank" rel="noreferrer"
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/40 text-slate-300 text-xs font-medium hover:bg-slate-700/60 transition border border-slate-600/30">
                                            <Github className="w-3.5 h-3.5" /> GitHub
                                        </a>
                                    )}
                                    {application.socialLinks?.portfolio && (
                                        <a href={application.socialLinks.portfolio} target="_blank" rel="noreferrer"
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-400 text-xs font-medium hover:bg-violet-500/20 transition border border-violet-500/20">
                                            <Globe className="w-3.5 h-3.5" /> Portfolio
                                        </a>
                                    )}
                                </div>
                            )}

                            {application.status === 'APPROVED' && (
                                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 shrink-0" />
                                    <span>Congratulations! Your account has been upgraded to VERIFIED ORGANIZER.</span>
                                </div>
                            )}

                            {application.status === 'REJECTED' && application.reviewNotes && (
                                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-medium">
                                    <p className="font-bold mb-0.5">Review Notes:</p>
                                    <p>{application.reviewNotes}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Application Form — Multi-step */
                        <div className="p-6 sm:p-8 rounded-3xl glass-card border border-slate-800 space-y-6">
                            {/* Form Header */}
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                        <BadgeCheck className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Apply for Organizer Verification</h2>
                                        <p className="text-xs text-slate-400">Complete all steps to submit your application.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Step Indicator */}
                            <StepIndicator steps={FORM_STEPS} currentStep={formStep} />

                            <form onSubmit={handleApplyOrganizer}>

                                {/* ─── Step 0: Organization Info ─── */}
                                {formStep === 0 && (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Building className="w-4 h-4 text-indigo-400" />
                                            <h3 className="text-sm font-bold text-white">Organization Details</h3>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                                Organization Name <span className="text-rose-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={appForm.orgName}
                                                onChange={(e) => updateForm('orgName', e.target.value)}
                                                placeholder="e.g., Tech Innovators Association"
                                                className="w-full p-3 rounded-xl glass-input text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                                Organization Website <span className="text-slate-500 font-normal">(optional)</span>
                                            </label>
                                            <div className="relative">
                                                <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type="url"
                                                    value={appForm.orgWebsite}
                                                    onChange={(e) => updateForm('orgWebsite', e.target.value)}
                                                    placeholder="https://yourorganization.com"
                                                    className="w-full pl-9 p-3 rounded-xl glass-input text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                                Organization Description <span className="text-rose-400">*</span>
                                            </label>
                                            <textarea
                                                required
                                                rows={4}
                                                value={appForm.orgDescription}
                                                onChange={(e) => updateForm('orgDescription', e.target.value)}
                                                placeholder="Briefly describe your organization — its mission, focus area, and what type of events you plan to host..."
                                                className="w-full p-3 rounded-xl glass-input text-sm resize-none"
                                            />
                                            <p className="text-[10px] text-slate-500 mt-1">{appForm.orgDescription.length}/500 characters</p>
                                        </div>
                                    </div>
                                )}

                                {/* ─── Step 1: Event Experience ─── */}
                                {formStep === 1 && (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Award className="w-4 h-4 text-indigo-400" />
                                            <h3 className="text-sm font-bold text-white">Event Experience</h3>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                                    Total Events Hosted <span className="text-rose-400">*</span>
                                                </label>
                                                <div className="relative">
                                                    <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                                    <input
                                                        type="number"
                                                        required
                                                        min="0"
                                                        value={appForm.totalEvents}
                                                        onChange={(e) => updateForm('totalEvents', e.target.value)}
                                                        className="w-full pl-9 p-3 rounded-xl glass-input text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                                    Largest Audience Size <span className="text-rose-400">*</span>
                                                </label>
                                                <div className="relative">
                                                    <Users className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                                    <input
                                                        type="number"
                                                        required
                                                        min="0"
                                                        value={appForm.largestAudience}
                                                        onChange={(e) => updateForm('largestAudience', e.target.value)}
                                                        className="w-full pl-9 p-3 rounded-xl glass-input text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                                Experience Summary <span className="text-rose-400">*</span>
                                            </label>
                                            <textarea
                                                required
                                                rows={5}
                                                value={appForm.experienceDesc}
                                                onChange={(e) => updateForm('experienceDesc', e.target.value)}
                                                placeholder="Describe your event management experience in detail — types of events you've organized, your team, tools used, and any notable successes..."
                                                className="w-full p-3 rounded-xl glass-input text-sm resize-none"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* ─── Step 2: Social Links ─── */}
                                {formStep === 2 && (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Link2 className="w-4 h-4 text-indigo-400" />
                                            <h3 className="text-sm font-bold text-white">Social Links & Online Presence</h3>
                                        </div>
                                        <p className="text-xs text-slate-500 mb-4">
                                            Add your professional profiles so our admin team can verify your identity and experience. All fields are optional.
                                        </p>

                                        <div className="space-y-3">
                                            {/* LinkedIn */}
                                            <SocialLinkInput
                                                icon={Linkedin}
                                                label="LinkedIn Profile"
                                                placeholder="https://linkedin.com/in/your-profile"
                                                value={appForm.linkedin}
                                                onChange={(e) => updateForm('linkedin', e.target.value)}
                                                accentColor="blue"
                                            />

                                            {/* GitHub */}
                                            <SocialLinkInput
                                                icon={Github}
                                                label="GitHub Profile"
                                                placeholder="https://github.com/your-username"
                                                value={appForm.github}
                                                onChange={(e) => updateForm('github', e.target.value)}
                                                accentColor="slate"
                                            />

                                            {/* Portfolio / Website */}
                                            <SocialLinkInput
                                                icon={Globe}
                                                label="Portfolio / Personal Website"
                                                placeholder="https://yourportfolio.com"
                                                value={appForm.portfolio}
                                                onChange={(e) => updateForm('portfolio', e.target.value)}
                                                accentColor="violet"
                                            />
                                        </div>

                                        <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 flex items-start gap-2 mt-2">
                                            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                            <p className="text-xs text-indigo-300">
                                                Social links help the admin verify your identity and experience. You can still submit without them, but they strengthen your application.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* ─── Step 3: Documents ─── */}
                                {formStep === 3 && (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <div className="flex items-center gap-2 mb-4">
                                            <FileText className="w-4 h-4 text-indigo-400" />
                                            <h3 className="text-sm font-bold text-white">Verification Documents</h3>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                                Document Type <span className="text-rose-400">*</span>
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {[
                                                    { value: 'COLLEGE_ID', label: '🎓 College ID' },
                                                    { value: 'ORGANIZATION_PROOF', label: '🏢 Organization Proof' },
                                                    { value: 'GOVERNMENT_ID', label: '🪪 Government ID' },
                                                    { value: 'OTHER', label: '📎 Other Document' },
                                                ].map((opt) => (
                                                    <button
                                                        type="button"
                                                        key={opt.value}
                                                        onClick={() => updateForm('documentType', opt.value)}
                                                        className={`p-3 rounded-xl text-xs font-semibold text-left transition-all border ${
                                                            appForm.documentType === opt.value
                                                                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                                                                : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                                                        }`}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                                Document URL <span className="text-rose-400">*</span>
                                            </label>
                                            <div className="relative">
                                                <Upload className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type="url"
                                                    required
                                                    value={appForm.documentUrl}
                                                    onChange={(e) => updateForm('documentUrl', e.target.value)}
                                                    placeholder="https://drive.google.com/file/... or direct image URL"
                                                    className="w-full pl-9 p-3 rounded-xl glass-input text-sm"
                                                />
                                            </div>
                                            <p className="text-[10px] text-slate-500 mt-1.5">
                                                Upload your document to Google Drive, Dropbox, or any file-sharing service and paste the public link here.
                                            </p>
                                        </div>

                                        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 flex items-start gap-2">
                                            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                            <p className="text-xs text-amber-300">
                                                Ensure your document link is publicly accessible. Private or restricted links cannot be reviewed by our admin team.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Navigation Buttons */}
                                <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
                                    {formStep > 0 ? (
                                        <button
                                            type="button"
                                            onClick={() => setFormStep(s => s - 1)}
                                            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-semibold transition-all"
                                        >
                                            ← Back
                                        </button>
                                    ) : <div />}

                                    {formStep < FORM_STEPS.length - 1 ? (
                                        <button
                                            type="button"
                                            disabled={
                                                (formStep === 0 && !canProceedStep0) ||
                                                (formStep === 1 && !canProceedStep1)
                                            }
                                            onClick={() => setFormStep(s => s + 1)}
                                            className="px-6 py-2.5 rounded-xl gradient-button text-sm font-bold text-white shadow-lg shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                        >
                                            Continue <ChevronRight className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={appSubmitting || !canProceedStep3}
                                            className="px-6 py-2.5 rounded-xl gradient-button text-sm font-bold text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            {appSubmitting ? (
                                                <>
                                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4" />
                                                    Submit Application
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    )}

                </div>
            )}

            {/* QR Code Modal */}
            <QRTicketModal
                isOpen={isQRModalOpen}
                onClose={() => setIsQRModalOpen(false)}
                registration={selectedRegistration}
            />

        </div>
    );
};
