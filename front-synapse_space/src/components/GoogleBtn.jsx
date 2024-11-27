import { GoogleLogin, GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import AxiosInstance from "../utils/AxiosInstance";
import React, {useContext, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faGoogle} from "@fortawesome/free-brands-svg-icons";
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ErrorAlert from "./ErrorAlert";

export default function GoogleBtn() {
    const { isLoggedinWithGoogle } = useContext(AuthContext);
    const [error, setError] = useState(null);
    const login = useGoogleLogin({
        onSuccess: async (response) => {
            try {
                const token = response.access_token;
                const res = await AxiosInstance.post(`${import.meta.env.VITE_API_BASE_URI}/api/auth/login/google/`, {
                    access_token: token,
                });
                console.log('Google login successful:', res.data);
                await isLoggedinWithGoogle()
            } catch (error) {
                const errorMessage = error.response?.data?.non_field_errors || 'Google login failed';
                setError(errorMessage);
                console.error('Google login failed:', errorMessage);

            }
        },
        onError: (error) => {
            setError(error);
            console.error('Google Login Error:', error);
        },
        scope: 'openid profile email',
        flow: 'implicit', // Implicit flow to get OAuth access token directly
    });

    return (
        <>
            {error && <ErrorAlert text={error} />}
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                <button className="btn btn-primary text-center w-full" onClick={login}>
                    <FontAwesomeIcon icon={faGoogle} />
                    Login with Google
                </button>
            </GoogleOAuthProvider>
        </>
    );
}
