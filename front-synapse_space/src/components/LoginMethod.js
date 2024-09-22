
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGoogle } from '@fortawesome/free-brands-svg-icons'
import {Link} from 'react-router-dom';
import LoginForm from './LoginForm';


export default function LoginMethod() {
    const [showLoginForm, setShowLoginForm] = useState(false);
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
                    <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" >
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="sr-only">Icon description</span>
                </button>
                <LoginForm />
            </div >
        );
    }else{
        return (
            <div>
                <div className="">
                    <h2 className="card-title justify-start">Welcome Back!</h2>
                    <div className="card-actions py-10 flex-col justify-center">
                        <button class="btn btn-primary  text-center w-full">
                            <FontAwesomeIcon icon={faGoogle} />
                            Login with Google
                        </button>
                        <div class="divider">or</div>
                        <button class="btn btn-wide w-full" onClick={handleLoginWithEmail}>
                            Login with Email
                        </button>
                    </div>
                    <article class="prose text-center max-w-sm text-sm justify-self-end self-center">
                        <p>
                            By Signing in, you agree to the Terms of Use, Community Rules, and Privacy Policy
                        </p>
                    </article>
                    <Link className="text-center text-xs text-gray-500 mt-4" to='/register'>
                        Don’t have an account? Sign up
                    </Link>
    
                </div>
            </div>
        );
    }

}