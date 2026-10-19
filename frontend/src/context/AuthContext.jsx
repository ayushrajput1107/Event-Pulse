import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });

    const [token, setToken] = useState(() => localStorage.getItem('accessToken') || null);
    const [loading, setLoading] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'
    const [toastMessage, setToastMessage] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const storedToken = localStorage.getItem('accessToken');
            if (storedToken) {
                try {
                    const res = await authAPI.getCurrentUser();
                    if (res.data?.success && res.data?.data) {
                        setUser(res.data.data);
                        localStorage.setItem('user', JSON.stringify(res.data.data));
                    }
                } catch (err) {
                    console.warn('Session expired or server unavailable:', err.message);
                    setUser(null);
                    setToken(null);
                    localStorage.removeItem('user');
                    localStorage.removeItem('accessToken');
                }
            }
        };
        fetchUser();
    }, []);

    const showToast = (message, type = 'info') => {
        setToastMessage({ message, type, id: Date.now() });
        setTimeout(() => {
            setToastMessage(null);
        }, 4000);
    };

    const login = async (email, password) => {
        setLoading(true);
        try {
            const res = await authAPI.login({ email, password });
            if (res.data?.success && res.data?.data) {
                const { user: userData, accessToken } = res.data.data;
                setUser(userData);
                setToken(accessToken);
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('accessToken', accessToken);
                showToast(`Welcome back, ${userData.profile?.firstName || 'User'}!`, 'success');
                setIsAuthModalOpen(false);
                setLoading(false);
                return { success: true };
            }
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
            showToast(errMsg, 'error');
            setLoading(false);
            return { success: false, error: errMsg };
        }
    };

    const register = async (formData) => {
        setLoading(true);
        try {
            const res = await authAPI.register(formData);
            if (res.data?.success && res.data?.data) {
                const { user: userData, accessToken } = res.data.data;
                setUser(userData);
                setToken(accessToken);
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('accessToken', accessToken);
                showToast('Account registered successfully!', 'success');
                setIsAuthModalOpen(false);
                setLoading(false);
                return { success: true };
            }
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Registration failed. Please try again.';
            showToast(errMsg, 'error');
            setLoading(false);
            return { success: false, error: errMsg };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        showToast('Logged out successfully', 'info');
    };

    const openAuthModal = (mode = 'login') => {
        setAuthModalMode(mode);
        setIsAuthModalOpen(true);
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            login,
            register,
            logout,
            isAuthModalOpen,
            setIsAuthModalOpen,
            authModalMode,
            setAuthModalMode,
            openAuthModal,
            showToast,
            toastMessage,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
