import React, { useState } from 'react';
import axios from 'axios';

export default function LoginForm() {
    const [username_or_email, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/auth/login/', {
                username_or_email,
                password,
            });
            const { access, refresh } = response.data;
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            console.log('Login successful', access, refresh);
        } catch (error) {
            setError('Invalid credentials');
            console.error('Login error', error);
            localStorage.setItem('err', "Invalid credentials");
        }
    };
    return (
        <form className="card-body max-w-sm mx-8  flex-col ">

            <div className="form-control">
                <label className="label">
                    <span className="label-text">Email or Username</span>
                </label>
                <input type="email" placeholder="email" 
                className="input input-bordered w-full max-w-xs"
                 value={username_or_email}
                 onChange={(e) => setUsername(e.target.value)}
                 required />
            </div>
            <div className="form-control ">
                <label className="label">
                    <span className="label-text">Password</span>
                </label>
                <input type="password"
                 placeholder="password"
                  className="input input-bordered w-full max-w-xs"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required />
                <label className="label">
                    <a href="#" className="label-text-alt link link-hover ">Forgot password?</a>
                </label>
            </div>
            <div className="form-control mt-6 ">
                <button className="btn  btn-primary w-full max-w-xs" type='submit' onClick={handleSubmit}>Login</button>
            </div>
        </form>

    );
}