import axios from 'axios';

const API_BASE = '/api';

export const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request Interceptor: Attach Access Token from LocalStorage
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Expiration Refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const res = await axios.post(`${API_BASE}/auth/refresh`, {}, { withCredentials: true });
                if (res.data?.data?.accessToken) {
                    const newToken = res.data.data.accessToken;
                    localStorage.setItem('accessToken', newToken);
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                }
            } catch (refreshErr) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
            }
        }
        return Promise.reject(error);
    }
);

// API Endpoint Wrappers matching the backend routes
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getCurrentUser: () => api.get('/auth/me'),
    changePassword: (data) => api.patch('/auth/change-password', data),
    refreshToken: () => api.post('/auth/refresh'),
};

export const eventAPI = {
    getPublicEvents: () => api.get('/events'),
    getEventById: (id) => api.get(`/events/${id}`),
    createEvent: (data) => api.post('/events', data),
    getMyEvents: () => api.get('/events/my-events'),
    updateEvent: (id, data) => api.patch(`/events/${id}`, data),
    deleteEvent: (id) => api.patch(`/events/${id}/delete`),
    publishEvent: (id) => api.patch(`/events/${id}/publish`),
    openRegistration: (id) => api.patch(`/events/${id}/open-registration`),
    closeRegistration: (id) => api.patch(`/events/${id}/close-registration`),
    startEvent: (id) => api.patch(`/events/${id}/start`),
    completeEvent: (id) => api.patch(`/events/${id}/complete`),
    cancelEvent: (id) => api.patch(`/events/${id}/cancel`),
};

export const registrationAPI = {
    register: (eventId, ticketCount) => api.post(`/registrations/${eventId}/register`, { ticketCount }),
    getMyRegistrations: () => api.get('/registrations/my-registrations'),
    cancelRegistration: (id) => api.patch(`/registrations/${id}/cancel`),
    getEventRegistrations: (eventId) => api.get(`/registrations/event/${eventId}`),
    approveRegistration: (id) => api.patch(`/registrations/${id}/approve`),
    rejectRegistration: (id, reviewNotes) => api.patch(`/registrations/${id}/reject`, { reviewNotes }),
};

export const organizerApplicationAPI = {
    apply: (data) => api.post('/organizer/apply', data),
    getMyApplication: () => api.get('/organizer/my-application'),
};

export const adminAPI = {
    getAllUsers: () => api.get('/admin/users'),
    suspendUser: (userId, reason) => api.patch(`/admin/users/${userId}/suspend`, { reason }),
    activateUser: (userId) => api.patch(`/admin/users/${userId}/activate`),
    getAllApplications: () => api.get('/admin/organizer-applications'),
    approveApplication: (appId) => api.patch(`/admin/organizer-applications/${appId}/approve`),
    rejectApplication: (appId, reviewNotes) => api.patch(`/admin/organizer-applications/${appId}/reject`, { reviewNotes }),
};
