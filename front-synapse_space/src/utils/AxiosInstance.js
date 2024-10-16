import axios from 'axios';

const AxiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URI,  // Update this to your backend URL
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