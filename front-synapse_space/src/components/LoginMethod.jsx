import React, {useState, useContext, useRef} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGoogle } from '@fortawesome/free-brands-svg-icons'
import {Link} from 'react-router-dom';
import LoginForm from './LoginForm';
import GoogleBtn from './GoogleBtn';
import {GoogleOAuthProvider} from "@react-oauth/google";




export default function LoginMethod() {
    const [showLoginForm, setShowLoginForm] = useState(false);
    const onSuccessRef = useRef(null);
    const onErrorRef = useRef(null);
    const handleLoginWithEmail = () => {
        setShowLoginForm(true);
    };

    const handleBackButton = () => {
        setShowLoginForm(false);
    };

    if (showLoginForm) {
        return (
            <div>
                <button type="button" onClick={handleBackButton} className="btn">
                    <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>

                    </svg>
                    <span className="sr-only">Icon description</span>
                </button>
                <LoginForm/>
            </div>
        );
    } else {
        return (
            <div>
            <div className="flex flex-col">
                    <h2 className="justify-start mb-5 card-title">Welcome Back!</h2>


                    <div className="flex-col justify-center py-10 card-actions">
                        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                            <GoogleBtn/>
                        </GoogleOAuthProvider>
                        <div className="divider">or</div>
                        <button className="w-full btn" onClick={handleLoginWithEmail}>
                            Login with Email
                        </button>
                    </div>
                    <article className="self-center max-w-sm text-sm prose text-center justify-self-end">
                        <p>
                            By Signing in, you agree to the 
                            <a href="/terms-of-use" className="text-blue-600 hover:underline"> Terms of Use</a>, 
                            Community Rules, and 
                            <a href="/privacy-policy" className="text-blue-600 hover:underline"> Privacy Policy</a>.
                        </p>
                    </article>

                    <Link className="justify-center mt-4 text-xs text-center text-gray-500" to='/register'>
                        Don’t have an account? Sign up
                    </Link>
    
                </div>
            </div>
        );
    }

}