import axios, { AxiosError } from 'axios';
import { User, CommunityStats, Activity, ApiError } from '../types';


const api = axios.create({
    baseURL: '/api',
    timeout: 10000,
});

// Request interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject({
            message: error.response?.data?.message || 'An unexpected error occurred',
            status: error.response?.status,
            code: error.response?.data?.code,
        });
    }
);


export const logout = () => api.post('/auth/logout');

// Users endpoints
export const fetchUsers = async () => {
    // Simulated API call
    return {
        data: [
            { id: 1, name: 'Sarah Chen', email: 'sarah@synapse.com', role: 'Management', status: 'Active', lastActive: '2024-03-15' },
            { id: 2, name: 'Mike Johnson', email: 'mike@synapse.com', role: 'Moderator', status: 'Active', lastActive: '2024-03-14' },
            { id: 3, name: 'Elena Rodriguez', email: 'elena@synapse.com', role: 'Member', status: 'Inactive', lastActive: '2024-03-10' },
        ] as User[]
    };
};

export const createUser = (userData: Partial<User>) =>
    api.post<User>('/users', userData);

export const updateUser = (id: number, userData: Partial<User>) =>
    api.put<User>(`/users/${id}`, userData);

export const deleteUser = (id: number) =>
    api.delete(`/users/${id}`);

// Stats endpoints
export const fetchCommunityStats = async () => {
    // Simulated API call
    return {
        data: {
            totalUsers: 1250,
            activeUsers: 890,
            totalPosts: 3456,
            newUsersToday: 25,
            engagementRate: '78%'
        } as CommunityStats
    };
};

// Activities endpoints
export const fetchRecentActivities = async () => {
    // Simulated API call
    return {
        data: [
            { id: 1, user: 'Alex Kim', action: 'Created new post', timestamp: '2024-03-15T10:30:00Z', type: 'post' },
            { id: 2, user: 'Lisa Wang', action: 'Reported content', timestamp: '2024-03-15T09:45:00Z', type: 'report' },
            { id: 3, user: 'James Smith', action: 'Joined community', timestamp: '2024-03-15T08:20:00Z', type: 'join' },
        ] as Activity[]
    };
};

// Posts endpoints
export const fetchPosts = () =>
    api.get('/posts');

export const createPost = (postData: any) =>
    api.post('/posts', postData);

export const updatePost = (id: number, postData: any) =>
    api.put(`/posts/${id}`, postData);

export const deletePost = (id: number) =>
    api.delete(`/posts/${id}`);

// Reports endpoints
export const fetchReports = () =>
    api.get('/reports');

export const updateReportStatus = (id: number, status: string) =>
    api.put(`/reports/${id}/status`, { status });

export default api;