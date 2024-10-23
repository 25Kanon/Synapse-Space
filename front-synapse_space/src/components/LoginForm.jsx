import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import ErrorAlert from './ErrorAlert';

export default function LoginForm() {
    let { loginUser, error} = useContext(AuthContext);

    return (
        <form className="card-body w-full mx-8 flex-col" onSubmit={loginUser}>
            {error && <ErrorAlert text={error} />}

            <div className="form-control mx-auto w-full">
                <div className="w-full">
                    <label className="label">
                        <span className="label-text">Email or Username</span>
                    </label>
                    <input type="hidden" name="otp" value=""/>
                    <input
                        type="text"
                        placeholder="email"
                        className="input input-bordered w-full max-w-xs"
                        name="username_or_email"
                        required
                    />
                </div>
            </div>
            <div className="form-control mx-auto w-full">
                <div className="w-full">
                    <label className="label">
                        <span className="label-text">Password</span>
                    </label>
                    <input
                        type="password"
                        placeholder="password"
                        className="input input-bordered w-full max-w-xs"
                        name="password"
                        required
                    />
                    <label className="label">
                        <a href="/" className="label-text-alt link link-hover">Forgot password?</a>
                    </label>
                </div>
            </div>
            <div className="form-control mt-6">
                <button className="btn btn-primary w-full max-w-xs" type="submit">Login</button>
            </div>
        </form>
    );
}