import axios from 'axios';

const AxiosInstance = axios.create({
    baseURL: 'http://localhost:8000',  // Update this to your backend URL
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