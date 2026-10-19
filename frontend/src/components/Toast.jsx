import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = () => {
    const { toastMessage } = useAuth();

    if (!toastMessage) return null;

    const { message, type } = toastMessage;

    const icons = {
        success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
        error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
        info: <Info className="w-5 h-5 text-indigo-400 shrink-0" />,
    };

    const borderColors = {
        success: 'border-emerald-500/30 bg-emerald-950/80 text-emerald-100',
        error: 'border-rose-500/30 bg-rose-950/80 text-rose-100',
        info: 'border-indigo-500/30 bg-slate-900/90 text-slate-100',
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl ${borderColors[type] || borderColors.info}`}>
                {icons[type] || icons.info}
                <span className="text-sm font-medium tracking-wide">{message}</span>
            </div>
        </div>
    );
};
