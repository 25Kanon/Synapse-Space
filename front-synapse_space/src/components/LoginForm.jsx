import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import ErrorAlert from './ErrorAlert';

export default function LoginForm() {
    let { loginUser, error} = useContext(AuthContext);

    return (
        <form className="flex-col w-full mx-8 card-body" onSubmit={loginUser}>
            {error && <ErrorAlert text={error} />}

            <div className="w-full mx-auto form-control">
                <div className="w-full">
                    <label className="label">
                        <span className="label-text">Email or Username</span>
                    </label>
                    <input type="hidden" name="otp" value=""/>
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
                <div className="w-full">
                    <label className="label">
                        <span className="label-text">Password</span>
                    </label>
                    <input
                        type="password"
                        placeholder="password"
                        className="w-full max-w-xs input input-bordered"
                        name="password"
                        required
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
    );
}