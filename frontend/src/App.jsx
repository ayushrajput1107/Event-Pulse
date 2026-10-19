import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';
import { AuthModal } from './components/AuthModal';
import { HomePage } from './pages/HomePage';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { AttendeeDashboard } from './pages/AttendeeDashboard';
import { OrganizerDashboard } from './pages/OrganizerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

// Protected Route Guard Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/" replace />;
    if (allowedRoles && !allowedRoles.includes(user.authorization?.role)) {
        return <Navigate to="/" replace />;
    }
    return children;
};

function AppContent() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white antialiased">
            <Navbar />
            <main className="flex-1">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/event/:eventId" element={<EventDetailsPage />} />

                    {/* Dashboards */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['ATTENDEE', 'ORGANIZER', 'VERIFIED_ORGANIZER', 'ADMIN']}>
                                <AttendeeDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/organizer"
                        element={
                            <ProtectedRoute allowedRoles={['VERIFIED_ORGANIZER', 'ADMIN']}>
                                <OrganizerDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Catch-all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>

            {/* Global Modals & Toast */}
            <AuthModal />
            <Toast />

            {/* Footer */}
            <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-400">
                <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p>© 2026 EventPulse Platform. Connected to Express Backend API.</p>
                    <div className="flex items-center gap-4 text-slate-400">
                        <span>Attendee Portal</span>
                        <span>•</span>
                        <span>Organizer Studio</span>
                        <span>•</span>
                        <span>Admin Console</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}
