import React, { createContext, useState, useEffect, useCallback } from 'react';
import AxiosInstance from '../utils/AxiosInstance';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { Navigate, useNavigate } from "react-router-dom";
import { loginUser as cometLogin } from '../lib/cometchat';
import { useAuthStore } from '../store/useAuthStore';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loginData, setLoginData] = useState(null);
    const [requireOTP, setRequireOTP] = useState(false);
    const [error, setError] = useState(null);
    const [authWithGoogle, setAuthWithGoogle] = useState(false);
    const [inSetup, setInSetup] = useState(true);
    const navigate = useNavigate();
    const { setCometUser, isAuthenticated: isCometAuthenticated} = useAuthStore();
    const [usernameOrEmail, setUsernameOrEmail] = useState(null);
    const checkAuthentication = useCallback(async () => {
        try {
            const response = await AxiosInstance.get('/api/auth/check-auth/', { withCredentials: true });
            setUser(response.data.user);
            return true;
        } catch (error) {
            console.error('Authentication check failed:', error);
            setUser(null);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (loading) {
            checkAuthentication();
        }
    }, [loading]);

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
                setUsernameOrEmail(e.target.username_or_email.value);
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
                setRequireOTP(false);
                setLoginData(null);
                console.error('An unexpected error occurred:', error);
            }
        }
    };


    const logout = async () => {
        try {
            await AxiosInstance.post('/api/auth/logout/', {}, { withCredentials: true, });
            setUser(null);
            setRequireOTP(false);
            setLoginData(null);
            console.log('logout')
        } catch (error) {
            console.error('Logout failed:', error);
            setUser(null);
            setRequireOTP(false);
            setLoginData(null);
        } finally{
            navigate('/login');
        }
    };

    const isLoggedinWithGoogle = async () => {
        setAuthWithGoogle(true)
        console.log(authWithGoogle)

        return authWithGoogle;
    }

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    const isCometChatLogin = async () => {
        if(!user){
            return await checkAuthentication();
        }else {
            try {
                if (!user.id) return false;
                if(!isCometAuthenticated){
                    const cometUser = await cometLogin(user?.id);
                    setCometUser(cometUser);
                    console.log('connected to chat')
                    return true
                }
                console.log({authStatus});
            } catch (error) {
                console.error('Login error:', error);
                return false;
            }
        }
    }

    const isAuthenticated = async () => {
        if (user) return true;
        return await checkAuthentication();
    };

    const isVerified = async () => {
        if (!user) return await checkAuthentication();
        if (user.isVerified) {
            setInSetup(false)
        }
        return (user.isVerified)
    }

    const isRejected = async () => {
        if (!user) return await checkAuthentication();
        return (user.is_rejected)
    }

    const isAdmin = async () => {
        const currentUser = user || await checkAuthentication();
        return currentUser?.is_superuser;
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            isVerified,
            isAdmin,
            isRejected,
            isCometChatLogin,
            user,
            isLoggedinWithGoogle,
            loading,
            loginUser,
            logout,
            requireOTP,
            error,
            usernameOrEmail
        }}>
            {children}
        </AuthContext.Provider>
    );
};
export default AuthContext;