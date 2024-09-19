import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';

export default function LoginForm() {
    let { loginUser } = useContext(AuthContext);
    return (
        <form className="card-body max-w-sm mx-8 flex-col" onSubmit={loginUser}>
            <div className="form-control">
                <label className="label">
                    <span className="label-text">Email or Username</span>
                </label>
                <input
                    type="text"
                    placeholder="email"
                    className="input input-bordered w-full max-w-xs"
                    name="username_or_email"
                    required
                />
            </div>
            <div className="form-control">
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
                    <a href="#" className="label-text-alt link link-hover">Forgot password?</a>
                </label>
            </div>
            <div className="form-control mt-6">
                <button className="btn btn-primary w-full max-w-xs" type="submit">Login</button>
            </div>
        </form>
    );
}
