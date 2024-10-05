import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
export default AuthContext;

export const AuthProvider = ({ children }) => {
    let [authToken, setAuthToken] = useState(() => localStorage.getItem('access_token') || null);
    let [user, setUser] = useState(null);
    let [loginData, setLoginData] = useState(null);
    let [requireOTP, setRequireOTP] = useState(false);
    let [loading, setLoading] = useState(true);
    let [error, setError] = useState(null);
    let navigate = useNavigate();

    const isAuthenticated = !!authToken;

    let loginUser = async (e) => {
        e.preventDefault();
        try {
            let data = {
                username_or_email: null,
                password: null,
            };

            if (requireOTP) {
                data = loginData;
                data.otp = e.target.otp.value;
            } else {
                data.username_or_email = e.target.username_or_email.value;
                data.password = e.target.password.value;
                setLoginData(data);
            }

            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URI}/api/auth/login/`, data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.message === "OTP required") {
                console.log('OTP required');
                setRequireOTP(true);
                setLoginData(data);
            } else {
                const { access, refresh } = response.data;
                localStorage.setItem('access_token', access);
                localStorage.setItem('refresh_token', refresh);
                setAuthToken(access);
                const decodedUser = jwtDecode(access);
                setUser(decodedUser);
                console.log('Login successful', response.data);
                setError(null);
                setLoginData(null)
                setRequireOTP(false)// Clear any previous error messages
                navigate('/'); // Redirect to the home page after successful login
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

    let refreshUserToken = () => {
        console.log('Refreshing token');
        axios.post(`${process.env.REACT_APP_API_BASE_URI}/api/auth/token/refresh/`, {
            'refresh': localStorage.getItem('refresh_token')

        }).then(response => {
            const { access, refresh } = response.data;
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            setAuthToken(access);
        }).catch(error => {
            console.error('Token refresh error', error);
            setError('Token refresh failed. Please login again.');
        });
        console.log('Refresh token', localStorage.getItem('refresh_token'))
    }

    let logoutUser = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URI}/api/auth/logout/`, { 'refresh': localStorage.getItem('refresh_token')}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json'
                }
            });
            setAuthToken(null);
            setUser(null);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        } catch (error) {
            console.error('Logout failed:', error);
            setError('Invalid access token')
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.reload();
        }
    }

    // Fetch user data if authenticated
    useEffect(() => {
        if (authToken) {
            const decodedUser = jwtDecode(authToken);
            const tokenExpirationTime = decodedUser.exp;
            const currentTime = Date.now() / 1000;
            if (tokenExpirationTime < currentTime)
                logoutUser();
            setUser(decodedUser);

        }
        setLoading(false);
    }, [authToken]);

    // Refresh token when near expiration
    useEffect(() => {
        const checkTokenExpiration = () => {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                return;
            }

            const decodedToken = jwtDecode(accessToken);
            const currentTime = Date.now() / 1000;
            const tokenExpirationTime = decodedToken.exp;
            console.log('Token expiration time:', tokenExpirationTime);

            if (tokenExpirationTime < currentTime) {
                logoutUser();
            } else if (tokenExpirationTime - currentTime < 60) {
                refreshUserToken();
            }
        };

        const intervalId = setInterval(checkTokenExpiration, 60000); // Check every minute

        return () => clearInterval(intervalId); 
    }, [authToken, loading]);



    let contextData = {
        loginUser,
        logoutUser,
        isAuthenticated,
        user,
        loading,
        requireOTP,
        error, // Include error in context data
    }

    return (
        <AuthContext.Provider value={contextData}>
            {!loading && children}
        </AuthContext.Provider>
    );
}