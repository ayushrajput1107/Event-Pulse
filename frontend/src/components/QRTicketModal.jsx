import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Calendar, MapPin, Ticket, Download, CheckCircle, ShieldCheck } from 'lucide-react';

export const QRTicketModal = ({ isOpen, onClose, registration, event }) => {
    if (!isOpen || !registration) return null;

    const eventData = event || registration.event || {};
    const basicInfo = eventData.basicInfo || {};
    const schedule = eventData.schedule || {};
    const venue = eventData.venue || {};

    const qrData = JSON.stringify({
        ticketId: registration._id,
        eventId: eventData._id,
        title: basicInfo.title,
        ticketCount: registration.ticketCount,
        status: registration.status,
    });

    const formatDate = (dateStr) => {
        if (!dateStr) return 'TBA';
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDownload = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
            <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden print:p-0 print:border-none print:shadow-none">

                {/* Ticket Header Banner */}
                <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-6 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-1.5 rounded-full transition print:hidden"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold mb-3 border border-white/20">
                        <Ticket className="w-3.5 h-3.5" />
                        <span>DIGITAL EVENT PASS</span>
                    </div>

                    <h2 className="text-xl font-extrabold line-clamp-2 leading-tight">{basicInfo.title || 'Event Pass'}</h2>
                    <p className="text-xs text-indigo-100 mt-1 opacity-90">{basicInfo.category || 'EVENT'} CONFERENCE</p>
                </div>

                {/* Ticket Body */}
                <div className="p-6 space-y-6 bg-slate-900">

                    {/* QR Code Card */}
                    <div className="flex flex-col items-center justify-center p-6 bg-slate-950 border border-slate-800 rounded-2xl text-center shadow-inner">
                        <div className="p-3 bg-white rounded-2xl shadow-xl mb-3">
                            <QRCodeSVG
                                value={qrData}
                                size={160}
                                bgColor="#FFFFFF"
                                fgColor="#0F172A"
                                level="H"
                                includeMargin={false}
                            />
                        </div>
                        <p className="text-[11px] font-mono text-slate-400">PASS ID: #{registration._id?.slice(-8).toUpperCase()}</p>
                        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>STATUS: {registration.status || 'CONFIRMED'}</span>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                                <span className="font-semibold text-[10px] uppercase">Start Date & Time</span>
                            </div>
                            <p className="font-bold text-slate-200">{formatDate(schedule.startDate)}</p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                                <MapPin className="w-3.5 h-3.5 text-violet-400" />
                                <span className="font-semibold text-[10px] uppercase">Venue / Link</span>
                            </div>
                            <p className="font-bold text-slate-200 truncate">
                                {venue.mode === 'ONLINE' ? 'Virtual Meeting' : venue.venueName || venue.city || 'On Site'}
                            </p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                            <span className="font-semibold text-[10px] text-slate-400 uppercase block mb-1">Admit Tickets</span>
                            <p className="font-extrabold text-indigo-400 text-sm">{registration.ticketCount || 1} Ticket(s)</p>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                            <span className="font-semibold text-[10px] text-slate-400 uppercase block mb-1">Verification</span>
                            <p className="font-bold text-emerald-400 flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5" /> Verified Pass
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex gap-3 print:hidden">
                        <button
                            onClick={handleDownload}
                            className="flex-1 gradient-button py-3 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                        >
                            <Download className="w-4 h-4" />
                            <span>Print / Download Ticket</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="px-5 py-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                        >
                            Close
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
};
