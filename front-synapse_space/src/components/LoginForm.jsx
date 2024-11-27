import React, { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';
import ErrorAlert from './ErrorAlert';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function LoginForm() {
    let { loginUser, error } = useContext(AuthContext);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <>
            <form className="flex-col w-full mx-8 card-body" onSubmit={loginUser}>
                <div className="w-full mx-auto form-control">
                    {error && <ErrorAlert text={error} classExtensions="min-w-sm max-w-sm" />}
                    <div className="w-full">
                        <label className="label">
                            <span className="label-text">Email or Username</span>
                        </label>
                        <input type="hidden" name="otp" value="" />
                        <input
                            type="text"
                            placeholder="email"
                            className="w-full max-w-xs input input-bordered"
                            name="username_or_email"
                            required
                        />
                    </div>
                </div>
                <div className="w-full mx-auto form-control">
                    <div className="relative w-full"> {/* Added relative positioning for icon */}
                        <label className="label">
                            <span className="label-text">Password</span>
                        </label>
                        <input
                            type={showPassword ? "text" : "password"} // Toggle input type
                            placeholder="password"
                            className="w-full max-w-xs input input-bordered"
                            name="password"
                            required
                        />
                        {/* Toggle Icon for Password Visibility */}
                        <FontAwesomeIcon
                            icon={showPassword ? faEye : faEyeSlash} // Change icon based on state
                            className="absolute cursor-pointer text-white-600 right-3 top-12"
                            onClick={() => setShowPassword(!showPassword)} // Toggle state on click
                        />
                        <label className="label">
                            <a href="/reset-password" className="label-text-alt link link-hover">Forgot password?</a>
                        </label>
                    </div>
                </div>
                <div className="mt-6 form-control">
                    <button className="w-full max-w-xs btn btn-primary" type="submit">Login</button>
                </div>
            </form>
        </>
    );
}
