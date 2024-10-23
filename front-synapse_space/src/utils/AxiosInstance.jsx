import axios from 'axios';

const AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URI,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor
AxiosInstance.interceptors.request.use(function (config) {
    // Log the headers being sent
    console.log('Request headers:', config.headers);
    return config;
}, function (error) {
    return Promise.reject(error);
});

export default AxiosInstance;