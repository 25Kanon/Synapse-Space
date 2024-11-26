import axios from 'axios';

const getCsrfToken = () => {
    const match = document.cookie.match(/csrftoken=([^;]+)/);
    return match ? match[1] : null;
};


const AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URI,
    withCredentials: true,
    headers: {
        "X-CSRFToken": getCsrfToken(),
        'Content-Type': 'application/json',
    },
});

AxiosInstance.interceptors.request.use((config) => {
    return config;
}, (error) => {
    return Promise.reject(error);
});

AxiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshResponse = await axios.post(`${import.meta.env.VITE_API_BASE_URI}/api/auth/token/refresh/`, {}, { withCredentials: true });
                const newAccessToken = refreshResponse.data.access;
                const newRefreshToken = refreshResponse.data.refresh;

                AxiosInstance.defaults.headers['Authorization'] = `Bearer ${newAccessToken}`;

                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return AxiosInstance(originalRequest);
            } catch (refreshError) {
                console.error('Error refreshing token:', refreshError);
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default AxiosInstance;
