import React, { createContext, useState, useEffect, useCallback } from 'react';
import AxiosInstance from '../utils/AxiosInstance';
import {jwtDecode} from 'jwt-decode';
import axios from 'axios';
import {Navigate, useNavigate} from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loginData, setLoginData] = useState(null);
    const [requireOTP, setRequireOTP] = useState(false);
    const [error, setError] = useState(null);
    const [authWithGoogle, setAuthWithGoogle] = useState(false);
    const navigate = useNavigate();
    const [isVerified, setIsVerified] = useState(false);


    const refreshToken = useCallback(async () => {
        try {
            console.log('refreshing token')
            const response = await AxiosInstance.post('/api/auth/token/refresh/', {}, { withCredentials: true });
            return response;
        } catch (error) {
            console.error('Error refreshing token:', error);
            console.log('Error refreshing token:', error)
            setError('Error refreshing token:', error);
            setUser(null);
            throw error;
        }
    }, []);

    const scheduleTokenRefresh = useCallback((token) => {
        const decodedToken = jwtDecode(token);
        const expirationTime = decodedToken.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        const timeUntilRefresh = expirationTime - currentTime - 60000; // Refresh 1 minute before expiry
        console.log('timeUntilRefresh', timeUntilRefresh)
        setTimeout(() => {
            refreshToken()
                .then(scheduleTokenRefresh)
                .catch(console.error);
        }, timeUntilRefresh);
    }, [refreshToken]);

    const checkAuthentication = useCallback(async () => {
        try {
            const response = await AxiosInstance.get('/api/auth/check-auth/', { withCredentials: true });
            console.log('user', response.data)
            setUser(response.data.user);
            console.log('user', user)
            // Schedule token refresh
            const cookies = document.cookie.split(';');
            const accessToken = cookies.find(cookie => cookie.trim().startsWith('access='));
            if (accessToken) {
                const token = accessToken.split('=')[1];
                scheduleTokenRefresh(token);
            }
            return true;
        } catch (error) {
            console.error('Authentication check failed:', error);
            setUser(null);
            return false;
        } finally {
            setLoading(false);
        }
    }, [scheduleTokenRefresh]);

    useEffect(() => {
        checkAuthentication();
    }, [checkAuthentication, loginData,authWithGoogle]);

    useEffect(() => {
        if (!isVerified) {
            navigate('/account-setup');
        }
    }, [isVerified]);


    const loginUser = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            let data = {
                username_or_email: null,
                password: null,
            };

            if (requireOTP) {
                data = loginData;
                data.otp = e.target.otp.value;
                console.log(data)
            } else {
                data.username_or_email = e.target.username_or_email.value;
                data.password = e.target.password.value;
                setLoginData(data);// Store login data for OTP
            }

            const response = await AxiosInstance.post(`/api/auth/login/`, data, {
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            // Check response for OTP requirement
            if (response.data.message === "OTP required") {
                console.log('OTP required');
                setRequireOTP(true);
                setLoginData(data);
            } else {
                console.log('Login successful', response.data);
                setUser(response.data.user);
                scheduleTokenRefresh(response.data.access);
                setRequireOTP(false);
                setLoginData(null);
                return response.data;
            }
        } catch (error) {
            if (error.response) {
                setError('Login failed. Please check your credentials and try again.');
                console.error('An error occurred:', error.response.data);
            } else {
                setError('An unexpected error occurred.');
                console.error('An unexpected error occurred:', error);
            }
        }
    };

    const logout = async () => {
        try {
            await AxiosInstance.post('/api/auth/logout/', {}, { withCredentials: true,});
            setUser(null);
            setRequireOTP(false);
            setLoginData(null);
            console.log('logout')
        } catch (error) {
            console.error('Logout failed:', error);
            setUser(null);
            setRequireOTP(false);
            setLoginData(null);

        }
    };

    const isLoggedinWithGoogle=()=>{
        setAuthWithGoogle(true)
        console.log(authWithGoogle)
        return authWithGoogle;
    }

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    const isAuthenticated = async () => {
        if (user) return true;
        return await checkAuthentication();
    };

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            user,
            isLoggedinWithGoogle,
            loading, 
            loginUser,
            logout, 
            refreshToken,
            requireOTP,
            error
        }}>
            {children}
        </AuthContext.Provider>
    );
};
export default AuthContext;