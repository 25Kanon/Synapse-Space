import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import ErrorAlert from '../components/ErrorAlert'; 


const AuthContext = createContext();
export default AuthContext;

export const AuthProvider = ({ children }) => {
    let [authToken, setAuthToken] = useState(() => localStorage.getItem('access_token') || null);
    let [user, setUser] = useState(null);
    let [loading, setLoading] = useState(true);
    let navigate = useNavigate();
    let [error, setError] = useState(null);


    // Check if the user is authenticated by checking if the token exists
    const isAuthenticated = !!authToken;

    let loginUser = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/auth/login/', {
                'username_or_email': e.target.username_or_email.value,
                'password': e.target.password.value,
            });
            const { access, refresh } = response.data;
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            setAuthToken(access);
            console.log('Login successful', access, refresh);
            navigate('/');
        } catch (error) {
            console.error('Login error', error);
            setError('Login failed. Please check your credentials and try again.');
        }
    }

    // Fetch user data if authenticated
    useEffect(() => {
        if (authToken) {
            // You could fetch user details here if needed, using the token.
            const decodedUser = jwtDecode(authToken);
            setUser(decodedUser);
        }
        setLoading(false); // Set loading to false once user data is fetched
    }, [authToken]);

    let logoutUser = () => {
        setAuthToken(null);
        setUser(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }

    let contextData = {
        loginUser,
        logoutUser,
        isAuthenticated,
        user,
        loading,
    }

    return (
        <AuthContext.Provider value={contextData}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
