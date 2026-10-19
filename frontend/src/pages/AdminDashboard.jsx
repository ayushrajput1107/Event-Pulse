import React, { useState, useEffect, useRef } from 'react';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    ShieldCheck, Users, Building, CheckCircle2, XCircle, Search, AlertOctagon,
    FileText, ExternalLink, RefreshCw, Linkedin, Github, Globe, Calendar,
    Award, Mail, Hash, Eye, X, ClipboardList, TrendingUp, Link2,
    BadgeCheck, AlertCircle, User, AlertTriangle, UserCheck, UserX
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════
   REUSABLE CONFIRM DIALOG
   Used for ALL critical/destructive actions
═══════════════════════════════════════════════════════ */
const ConfirmDialog = ({
    isOpen, onClose, onConfirm,
    title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
    variant = 'danger',         // 'danger' | 'warning' | 'success'
    icon: Icon = AlertTriangle,
    children,                   // optional extra content (e.g. textarea)
    confirmDisabled = false,
}) => {
    useEffect(() => {
        if (!isOpen) return;
        const fn = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', fn);
        return () => document.removeEventListener('keydown', fn);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const variantMap = {
        danger:  { iconBg: 'bg-rose-500/15',    iconColor: 'text-rose-400',    confirmCls: 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20',    border: 'border-rose-500/30'    },
        warning: { iconBg: 'bg-amber-500/15',   iconColor: 'text-amber-400',   confirmCls: 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20',   border: 'border-amber-500/30'   },
        success: { iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-400', confirmCls: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20', border: 'border-emerald-500/30' },
    };
    const v = variantMap[variant] || variantMap.danger;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden"
                style={{ animation: 'confirmIn 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}
            >
                {/* Top accent stripe */}
                <div className={`h-0.5 w-full ${variant === 'success' ? 'bg-emerald-500' : variant === 'warning' ? 'bg-amber-500' : 'bg-rose-500'}`} />

                <div className="p-6 space-y-5">
                    {/* Icon + Title */}
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-2xl ${v.iconBg} flex items-center justify-center shrink-0`}>
                            <Icon className={`w-6 h-6 ${v.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                            <h3 className="text-lg font-extrabold text-white leading-snug">{title}</h3>
                            {message && <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">{message}</p>}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-all shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Warning banner */}
                    {variant === 'danger' && (
                        <div className={`flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-950/40 border ${v.border}`}>
                            <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                            <p className="text-xs text-rose-300 font-medium">This action cannot be undone. Please review carefully.</p>
                        </div>
                    )}
                    {variant === 'warning' && (
                        <div className={`flex items-center gap-2.5 p-3.5 rounded-xl bg-amber-950/40 border ${v.border}`}>
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                            <p className="text-xs text-amber-300 font-medium">Please confirm you want to proceed with this action.</p>
                        </div>
                    )}

                    {/* Optional extra slot (textareas etc.) */}
                    {children && <div>{children}</div>}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-1">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-sm transition-all border border-slate-700"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={confirmDisabled}
                            className={`flex-1 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed ${v.confirmCls}`}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes confirmIn {
                    from { opacity: 0; transform: scale(0.9) translateY(10px); }
                    to   { opacity: 1; transform: scale(1)   translateY(0);    }
                }
            `}</style>
        </div>
    );
};


/* ═══════════════════════════════════════════════════════
   APPLICATION DETAIL DRAWER
═══════════════════════════════════════════════════════ */
const ApplicationDetailDrawer = ({ app, onClose, onApprove, onReject }) => {
    const drawerRef = useRef(null);

    useEffect(() => {
        const fn = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', fn);
        return () => document.removeEventListener('keydown', fn);
    }, [onClose]);

    if (!app) return null;

    const applicant = app.applicant || {};
    const profile   = applicant.profile || {};
    const org       = app.organization || {};
    const exp       = app.eventExperience || {};
    const social    = app.socialLinks || {};
    const docs      = app.documents || [];

    const statusConfig = {
        PENDING:      { bg: 'bg-amber-500/20',   text: 'text-amber-300',   border: 'border-amber-500/30',   label: 'Pending Review' },
        UNDER_REVIEW: { bg: 'bg-blue-500/20',    text: 'text-blue-300',    border: 'border-blue-500/30',    label: 'Under Review'  },
        APPROVED:     { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/30', label: 'Approved'      },
        REJECTED:     { bg: 'bg-rose-500/20',    text: 'text-rose-300',    border: 'border-rose-500/30',    label: 'Rejected'      },
    };
    const s = statusConfig[app.status] || statusConfig.PENDING;

    const docTypeLabel = {
        COLLEGE_ID:         '🎓 College ID',
        ORGANIZATION_PROOF: '🏢 Organization Proof',
        GOVERNMENT_ID:      '🪪 Government ID',
        OTHER:              '📎 Other Document',
    };

    return (
        <div className="fixed inset-0 z-50 flex" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />
            <div
                ref={drawerRef}
                className="relative ml-auto w-full max-w-2xl h-full bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl overflow-hidden"
                style={{ animation: 'slideInRight 0.25s ease-out' }}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-slate-800 shrink-0">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${s.bg} ${s.text} ${s.border}`}>{s.label}</span>
                            <span className="text-xs text-slate-500">
                                {app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                            </span>
                        </div>
                        <h2 className="text-xl font-extrabold text-white">{org.name || 'Organization Application'}</h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Submitted by <span className="text-slate-200 font-semibold">{profile.firstName} {profile.lastName}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all ml-4 shrink-0">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Applicant */}
                    <section className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><User className="w-3.5 h-3.5" /> Applicant</h3>
                        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white text-lg shrink-0 shadow-lg shadow-indigo-500/20">
                                {profile.firstName?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-white text-base">{profile.firstName} {profile.lastName}</p>
                                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3" /> {applicant.auth?.email || '—'}</p>
                                <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5"><Hash className="w-3 h-3" /> {app._id}</p>
                            </div>
                        </div>
                    </section>

                    {/* Organization */}
                    <section className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Building className="w-3.5 h-3.5" /> Organization</h3>
                        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                            <div>
                                <p className="font-bold text-white text-base">{org.name || '—'}</p>
                                {org.website && (
                                    <a href={org.website} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-0.5 hover:underline">
                                        <Globe className="w-3 h-3" /> {org.website}
                                    </a>
                                )}
                            </div>
                            <div className="pt-3 border-t border-slate-800">
                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Description</p>
                                <p className="text-sm text-slate-300 leading-relaxed">{org.description || 'No description provided.'}</p>
                            </div>
                        </div>
                    </section>

                    {/* Experience */}
                    <section className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Award className="w-3.5 h-3.5" /> Event Experience</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
                                <p className="text-3xl font-black text-indigo-400">{exp.totalEventsHosted ?? 0}</p>
                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mt-1">Events Hosted</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
                                <p className="text-3xl font-black text-violet-400">{exp.largestAudience ?? 0}</p>
                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mt-1">Largest Audience</p>
                            </div>
                        </div>
                        {exp.experienceDescription && (
                            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Experience Summary</p>
                                <p className="text-sm text-slate-300 leading-relaxed">{exp.experienceDescription}</p>
                            </div>
                        )}
                    </section>

                    {/* Social Links */}
                    <section className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Link2 className="w-3.5 h-3.5" /> Social Links</h3>
                        {!social.linkedin && !social.github && !social.portfolio ? (
                            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-600">No social links provided</div>
                        ) : (
                            <div className="space-y-2">
                                {social.linkedin && (
                                    <a href={social.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/15 transition-all group">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0"><Linkedin className="w-4 h-4 text-blue-400" /></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wide">LinkedIn</p>
                                            <p className="text-xs text-blue-300 truncate group-hover:underline">{social.linkedin}</p>
                                        </div>
                                        <ExternalLink className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                    </a>
                                )}
                                {social.github && (
                                    <a href={social.github} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 hover:bg-slate-800 transition-all group">
                                        <div className="w-8 h-8 rounded-lg bg-slate-700/60 flex items-center justify-center shrink-0"><Github className="w-4 h-4 text-slate-300" /></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">GitHub</p>
                                            <p className="text-xs text-slate-300 truncate group-hover:underline">{social.github}</p>
                                        </div>
                                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                    </a>
                                )}
                                {social.portfolio && (
                                    <a href={social.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/20 hover:border-violet-500/40 hover:bg-violet-500/15 transition-all group">
                                        <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0"><Globe className="w-4 h-4 text-violet-400" /></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-semibold text-violet-500 uppercase tracking-wide">Portfolio</p>
                                            <p className="text-xs text-violet-300 truncate group-hover:underline">{social.portfolio}</p>
                                        </div>
                                        <ExternalLink className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                                    </a>
                                )}
                            </div>
                        )}
                    </section>

                    {/* Documents */}
                    <section className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> Submitted Documents</h3>
                        {docs.length === 0 ? (
                            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-600">No documents submitted</div>
                        ) : (
                            <div className="space-y-2">
                                {docs.map((doc, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0"><FileText className="w-4 h-4 text-indigo-400" /></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{docTypeLabel[doc.documentType] || doc.documentType}</p>
                                            <p className="text-xs text-slate-400 truncate">{doc.documentUrl}</p>
                                        </div>
                                        <a href={doc.documentUrl} target="_blank" rel="noreferrer" className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors">
                                            <ExternalLink className="w-3 h-3" /> View
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Review Decision (if done) */}
                    {app.status !== 'PENDING' && app.reviewedAt && (
                        <section className="space-y-3">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><ClipboardList className="w-3.5 h-3.5" /> Review Decision</h3>
                            <div className={`p-4 rounded-2xl border space-y-2 ${app.status === 'APPROVED' ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-rose-950/30 border-rose-500/30'}`}>
                                <div className="flex items-center gap-2">
                                    {app.status === 'APPROVED' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                                    <span className={`text-sm font-bold ${app.status === 'APPROVED' ? 'text-emerald-300' : 'text-rose-300'}`}>
                                        {app.status === 'APPROVED' ? 'Application Approved' : 'Application Rejected'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400">
                                    Reviewed on {new Date(app.reviewedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    {app.reviewedBy && ` by ${app.reviewedBy.profile?.firstName || 'Admin'}`}
                                </p>
                                {app.reviewNotes && (
                                    <div className="pt-2 border-t border-slate-700/50">
                                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Review Notes</p>
                                        <p className="text-xs text-slate-300">{app.reviewNotes}</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}
                </div>

                {/* Sticky Action Footer */}
                {app.status === 'PENDING' && (
                    <div className="shrink-0 p-5 border-t border-slate-800 bg-slate-900/80 backdrop-blur-xl flex items-center gap-3">
                        <button
                            onClick={() => onApprove(app)}
                            className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                        >
                            <BadgeCheck className="w-4 h-4" /> Approve Organizer
                        </button>
                        <button
                            onClick={() => onReject(app)}
                            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 font-bold text-sm flex items-center justify-center gap-2 transition-all"
                        >
                            <XCircle className="w-4 h-4" /> Reject Application
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to   { transform: translateX(0);    opacity: 1; }
                }
            `}</style>
        </div>
    );
};


/* ═══════════════════════════════════════════════════════
   MAIN ADMIN DASHBOARD
═══════════════════════════════════════════════════════ */
export const AdminDashboard = () => {
    const { showToast } = useAuth();
    const [users,        setUsers]        = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [activeTab,    setActiveTab]    = useState('applications');

    // Filters
    const [userSearch,      setUserSearch]      = useState('');
    const [appStatusFilter, setAppStatusFilter] = useState('ALL');

    // Detail Drawer
    const [detailApp, setDetailApp] = useState(null);

    /* ── Confirm-Dialog state ── */
    // Each dialog has its own open flag + payload
    const [approveConfirm, setApproveConfirm] = useState({ open: false, app: null });
    const [rejectConfirm,  setRejectConfirm]  = useState({ open: false, app: null, notes: '' });
    const [suspendConfirm, setSuspendConfirm] = useState({ open: false, user: null, reason: '' });
    const [activateConfirm,setActivateConfirm]= useState({ open: false, user: null });

    useEffect(() => { fetchAdminData(); }, []);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const [uRes, aRes] = await Promise.allSettled([
                adminAPI.getAllUsers(),
                adminAPI.getAllApplications(),
            ]);
            setUsers(uRes.status === 'fulfilled' && uRes.value.data?.data ? (Array.isArray(uRes.value.data.data) ? uRes.value.data.data : []) : []);
            setApplications(aRes.status === 'fulfilled' && aRes.value.data?.data ? (Array.isArray(aRes.value.data.data) ? aRes.value.data.data : []) : []);
        } catch (err) {
            console.warn('Admin fetch error:', err.message);
            setUsers([]); setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    /* ── Handlers (execute AFTER confirmation) ── */
    const execApprove = async () => {
        const { app } = approveConfirm;
        setApproveConfirm({ open: false, app: null });
        try {
            await adminAPI.approveApplication(app._id);
            fetchAdminData();
            showToast('Organizer Application APPROVED!', 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Approval failed', 'error');
        }
    };

    const execReject = async () => {
        const { app, notes } = rejectConfirm;
        setRejectConfirm({ open: false, app: null, notes: '' });
        try {
            await adminAPI.rejectApplication(app._id, notes);
            fetchAdminData();
            showToast('Organizer Application Rejected', 'info');
        } catch (err) {
            showToast(err.response?.data?.message || 'Rejection failed', 'error');
        }
    };

    const execSuspend = async () => {
        const { user, reason } = suspendConfirm;
        setSuspendConfirm({ open: false, user: null, reason: '' });
        try {
            await adminAPI.suspendUser(user._id, reason);
            fetchAdminData();
            showToast(`${user.profile?.firstName}'s account suspended`, 'info');
        } catch (err) {
            showToast(err.response?.data?.message || 'Suspension failed', 'error');
        }
    };

    const execActivate = async () => {
        const { user } = activateConfirm;
        setActivateConfirm({ open: false, user: null });
        try {
            await adminAPI.activateUser(user._id);
            fetchAdminData();
            showToast('User account reactivated', 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Activation failed', 'error');
        }
    };

    /* ── Trigger helpers that open dialogs ── */
    const askApprove = (app) => { setDetailApp(null); setApproveConfirm({ open: true, app }); };
    const askReject  = (app) => { setDetailApp(null); setRejectConfirm({ open: true, app, notes: '' }); };
    const askSuspend = (u)   => setSuspendConfirm({ open: true, user: u, reason: '' });
    const askActivate = (u)  => setActivateConfirm({ open: true, user: u });

    const filteredUsers = users.filter(u =>
        u.profile?.firstName?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.profile?.lastName?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.auth?.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.authorization?.role?.toLowerCase().includes(userSearch.toLowerCase())
    );

    const filteredApps = appStatusFilter === 'ALL'
        ? applications
        : applications.filter(a => a.status === appStatusFilter);

    const statusBadge = (status) => {
        const map = {
            PENDING:      'bg-amber-500/20 text-amber-300 border-amber-500/30',
            UNDER_REVIEW: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
            APPROVED:     'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
            REJECTED:     'bg-rose-500/20 text-rose-300 border-rose-500/30',
        };
        return `px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${map[status] || map.PENDING}`;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

            {/* Header */}
            <div className="p-6 rounded-3xl glass-card border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">System Administration</span>
                    <h1 className="text-2xl font-extrabold text-white mt-1">Platform Admin Console</h1>
                    <p className="text-xs text-slate-400 mt-0.5">Review organizer applications, manage users, and enforce platform policies.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchAdminData}
                        disabled={loading}
                        className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all border border-slate-700"
                        title="Refresh Data"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
                        <button
                            onClick={() => setActiveTab('applications')}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${activeTab === 'applications' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Building className="w-4 h-4" />
                            <span>Applications ({applications.length})</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Users className="w-4 h-4" />
                            <span>Manage Users ({users.length})</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Pending Review',     value: applications.filter(a => a.status === 'PENDING').length,                          color: 'text-amber-400'   },
                    { label: 'Total Applications', value: applications.length,                                                               color: 'text-white'       },
                    { label: 'Total System Users', value: users.length,                                                                      color: 'text-white'       },
                    { label: 'Verified Organizers',value: users.filter(u => u.authorization?.role === 'VERIFIED_ORGANIZER').length,          color: 'text-emerald-400' },
                ].map(({ label, value, color }) => (
                    <div key={label} className="p-5 rounded-3xl glass-card border border-slate-800">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
                        <p className={`text-3xl font-black mt-1 ${color}`}>{value}</p>
                    </div>
                ))}
            </div>

            {/* ─── Applications Tab ─── */}
            {activeTab === 'applications' && (
                <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Building className="w-5 h-5 text-indigo-400" /> Organizer Verification Queue
                        </h2>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {['ALL','PENDING','APPROVED','REJECTED'].map(f => (
                                <button key={f} onClick={() => setAppStatusFilter(f)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${appStatusFilter === f ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}>
                                    {f === 'ALL'      ? `All (${applications.length})` :
                                     f === 'PENDING'  ? `Pending (${applications.filter(a => a.status === 'PENDING').length})` :
                                     f === 'APPROVED' ? `Approved (${applications.filter(a => a.status === 'APPROVED').length})` :
                                                        `Rejected (${applications.filter(a => a.status === 'REJECTED').length})`}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filteredApps.length > 0 ? (
                        <div className="space-y-3">
                            {filteredApps.map((app) => {
                                const applicant = app.applicant || {};
                                const profile   = applicant.profile || {};
                                const org       = app.organization || {};
                                const exp       = app.eventExperience || {};
                                const social    = app.socialLinks || {};
                                const docs      = app.documents || [];

                                return (
                                    <div key={app._id} className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                            <div className="space-y-2 flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-base font-bold text-white">{org.name || 'Organization'}</span>
                                                    <span className={statusBadge(app.status)}>{app.status.replace('_', ' ')}</span>
                                                    <span className="text-[10px] text-slate-600">{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : ''}</span>
                                                </div>
                                                <p className="text-xs text-slate-400 line-clamp-2">{org.description || '—'}</p>
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-[9px] shrink-0">
                                                        {profile.firstName?.[0]?.toUpperCase() || 'U'}
                                                    </div>
                                                    <span className="font-semibold text-slate-300">{profile.firstName} {profile.lastName}</span>
                                                    <span className="text-slate-600">•</span>
                                                    <span>{applicant.auth?.email || '—'}</span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 pt-1">
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                        <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                                        <span><strong className="text-slate-200">{exp.totalEventsHosted ?? 0}</strong> events hosted</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                        <TrendingUp className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                                                        <span>Max audience: <strong className="text-slate-200">{exp.largestAudience ?? 0}</strong></span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        {social.linkedin  && <span className="w-5 h-5 rounded-md bg-blue-500/20 flex items-center justify-center" title="LinkedIn"><Linkedin className="w-2.5 h-2.5 text-blue-400" /></span>}
                                                        {social.github    && <span className="w-5 h-5 rounded-md bg-slate-700/60 flex items-center justify-center" title="GitHub"><Github className="w-2.5 h-2.5 text-slate-300" /></span>}
                                                        {social.portfolio && <span className="w-5 h-5 rounded-md bg-violet-500/20 flex items-center justify-center" title="Portfolio"><Globe className="w-2.5 h-2.5 text-violet-400" /></span>}
                                                        {docs.length > 0 && <span className="flex items-center gap-1 text-[10px] text-slate-500"><FileText className="w-2.5 h-2.5" /> {docs.length} doc{docs.length > 1 ? 's' : ''}</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                                                <button
                                                    onClick={() => setDetailApp(app)}
                                                    className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all border border-slate-700 hover:border-slate-600"
                                                >
                                                    <Eye className="w-3.5 h-3.5" /> View Details
                                                </button>
                                                {app.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => askApprove(app)}
                                                            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all"
                                                        >
                                                            <BadgeCheck className="w-3.5 h-3.5" /> Approve
                                                        </button>
                                                        <button
                                                            onClick={() => askReject(app)}
                                                            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-300 hover:text-rose-400 border border-slate-800 hover:border-rose-500/40 text-xs font-semibold transition-all"
                                                        >
                                                            <XCircle className="w-3.5 h-3.5" /> Reject
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {app.status !== 'PENDING' && app.reviewedAt && (
                                            <div className={`mt-4 pt-3 border-t border-slate-800/60 flex items-center gap-2 text-xs ${app.status === 'APPROVED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {app.status === 'APPROVED' ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                                                <span>
                                                    {app.status === 'APPROVED' ? 'Approved' : 'Rejected'} on {new Date(app.reviewedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    {app.reviewNotes && <span className="text-slate-500"> — "{app.reviewNotes.slice(0, 80)}{app.reviewNotes.length > 80 ? '…' : ''}"</span>}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-12 text-center rounded-2xl bg-slate-950/50 border border-slate-800">
                            <Building className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                            <p className="text-sm font-bold text-white">No Applications Found</p>
                            <p className="text-xs text-slate-500 mt-1">
                                {appStatusFilter === 'ALL' ? 'No organizer applications have been submitted yet.' : `No ${appStatusFilter.toLowerCase()} applications.`}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* ─── Users Tab ─── */}
            {activeTab === 'users' && (
                <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-400" /> System User Accounts
                        </h2>
                        <div className="relative w-full sm:w-72">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or role..."
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-800">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px] font-semibold">
                                    <th className="py-3.5 px-5">User</th>
                                    <th className="py-3.5 px-5">Role</th>
                                    <th className="py-3.5 px-5">Account Status</th>
                                    <th className="py-3.5 px-5 text-right">Admin Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-slate-300">
                                {filteredUsers.length > 0 ? filteredUsers.map((u) => {
                                    const isSuspended = u.account?.status === 'SUSPENDED';
                                    const roleColors = {
                                        ADMIN:              'bg-amber-500/20 text-amber-300 border-amber-500/30',
                                        VERIFIED_ORGANIZER: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                                        ORGANIZER:          'bg-purple-500/20 text-purple-300 border-purple-500/30',
                                        ATTENDEE:           'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
                                    };
                                    return (
                                        <tr key={u._id} className="hover:bg-slate-900/50 transition">
                                            <td className="py-4 px-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white text-xs shrink-0">
                                                        {u.profile?.firstName?.[0]?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white">{u.profile?.firstName} {u.profile?.lastName}</p>
                                                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                            <Mail className="w-2.5 h-2.5" /> {u.auth?.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-5">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleColors[u.authorization?.role] || roleColors.ATTENDEE}`}>
                                                    {u.authorization?.role?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="py-4 px-5">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${isSuspended ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'}`}>
                                                    {u.account?.status || 'ACTIVE'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-5 text-right">
                                                {u.authorization?.role !== 'ADMIN' && (
                                                    isSuspended ? (
                                                        <button
                                                            onClick={() => askActivate(u)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all"
                                                        >
                                                            <UserCheck className="w-3 h-3" /> Activate
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => askSuspend(u)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-300 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 text-[11px] font-semibold transition-all"
                                                        >
                                                            <UserX className="w-3 h-3" /> Suspend
                                                        </button>
                                                    )
                                                )}
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr><td colSpan={4} className="py-10 text-center text-xs text-slate-500">No users match your search.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ══ Application Detail Drawer ══ */}
            {detailApp && (
                <ApplicationDetailDrawer
                    app={detailApp}
                    onClose={() => setDetailApp(null)}
                    onApprove={(app) => askApprove(app)}
                    onReject={(app)  => askReject(app)}
                />
            )}

            {/* ══ CONFIRM: Approve Application ══ */}
            <ConfirmDialog
                isOpen={approveConfirm.open}
                onClose={() => setApproveConfirm({ open: false, app: null })}
                onConfirm={execApprove}
                variant="success"
                icon={BadgeCheck}
                title="Approve Organizer Application?"
                message={`You are about to grant VERIFIED ORGANIZER status to ${approveConfirm.app?.applicant?.profile?.firstName || 'this applicant'} from "${approveConfirm.app?.organization?.name || 'their organization'}". They will immediately gain access to create and manage events on the platform.`}
                confirmLabel="Yes, Approve"
                cancelLabel="Go Back"
            />

            {/* ══ CONFIRM: Reject Application ══ */}
            <ConfirmDialog
                isOpen={rejectConfirm.open}
                onClose={() => setRejectConfirm({ open: false, app: null, notes: '' })}
                onConfirm={execReject}
                variant="danger"
                icon={XCircle}
                title="Reject This Application?"
                message={`You are about to reject the organizer application from "${rejectConfirm.app?.organization?.name || 'this organization'}". Please provide feedback notes for the applicant.`}
                confirmLabel="Confirm Rejection"
                cancelLabel="Cancel"
                confirmDisabled={!rejectConfirm.notes.trim()}
            >
                <textarea
                    rows={3}
                    value={rejectConfirm.notes}
                    onChange={(e) => setRejectConfirm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Explain the reason for rejection so the applicant can improve their resubmission…"
                    className="w-full p-3 rounded-xl glass-input text-sm"
                />
                <p className="text-xs text-slate-500 mt-1.5">Feedback notes are visible to the applicant. Required to proceed.</p>
            </ConfirmDialog>

            {/* ══ CONFIRM: Suspend User ══ */}
            <ConfirmDialog
                isOpen={suspendConfirm.open}
                onClose={() => setSuspendConfirm({ open: false, user: null, reason: '' })}
                onConfirm={execSuspend}
                variant="danger"
                icon={UserX}
                title={`Suspend ${suspendConfirm.user?.profile?.firstName || 'this user'}'s Account?`}
                message={`The account of ${suspendConfirm.user?.profile?.firstName} ${suspendConfirm.user?.profile?.lastName} (${suspendConfirm.user?.auth?.email}) will be suspended. They will immediately lose access to the platform.`}
                confirmLabel="Yes, Suspend Account"
                cancelLabel="Cancel"
            >
                <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">Suspension Reason <span className="text-slate-600 font-normal">(optional)</span></label>
                    <textarea
                        rows={2}
                        value={suspendConfirm.reason}
                        onChange={(e) => setSuspendConfirm(prev => ({ ...prev, reason: e.target.value }))}
                        placeholder="e.g. Repeated violation of community guidelines…"
                        className="w-full p-3 rounded-xl glass-input text-sm"
                    />
                </div>
            </ConfirmDialog>

            {/* ══ CONFIRM: Reactivate User ══ */}
            <ConfirmDialog
                isOpen={activateConfirm.open}
                onClose={() => setActivateConfirm({ open: false, user: null })}
                onConfirm={execActivate}
                variant="warning"
                icon={UserCheck}
                title={`Reactivate ${activateConfirm.user?.profile?.firstName || 'this user'}'s Account?`}
                message={`${activateConfirm.user?.profile?.firstName} ${activateConfirm.user?.profile?.lastName} will regain full access to EventPulse immediately. Make sure their prior suspension reason has been resolved before reactivating.`}
                confirmLabel="Yes, Reactivate Account"
                cancelLabel="Cancel"
            />

        </div>
    );
};
