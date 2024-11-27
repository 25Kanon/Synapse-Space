import React, { useContext, useState } from 'react';
import { KeyRound, UserCircle, EyeOff, Eye } from 'lucide-react';
import OTPformStaff from '../../components/OTPformStaff';
import AuthContext from '../../context/AuthContext';
import ErrorAlert from '../../components/ErrorAlert';

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { requireOTP, loginStaff, error} = useContext(AuthContext);

    return (
     <>
                {requireOTP ? (
                    <div className="hero bg-base-200 min-h-screen ">
                        <div className="card card-side bg-base-100 shadow-xl p-5 flex flex-row ">
                            <OTPformStaff/>
                        </div>
                    </div>
                        ) : (
                        <>
                            <div className="min-h-screen bg-base-300 flex items-center justify-center p-4">
                                <div className="max-w-md w-full">
                                    {error && <ErrorAlert text={error} classExtensions="min-w-sm max-w-sm"/>}
                                    <div className="text-center mb-8">
                                        <div
                                            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4 shadow-lg"
                                        >
                                            <KeyRound className="w-8 h-8"/>
                                        </div>
                                        <h2 className="text-2xl font-bold">Staff Portal</h2>
                                        <p className="text-accent mt-2">Welcome back! Please enter your credentials.</p>
                                    </div>

                                    <form onSubmit={loginStaff}
                                          className="bg-base-100 rounded-xl shadow-xl p-8 space-y-6">
                                        <div className="space-y-2">
                                            <label htmlFor="email" className="text-sm font-medium text-secondary block">
                                                Email
                                            </label>
                                            <div className="relative">
                                                <div
                                                    className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <UserCircle className="h-5 w-5 text-gray-400"/>
                                                </div>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    required
                                                    className="input w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-colors"
                                                    placeholder="email"
                                                    name="username_or_email"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="password"
                                                   className="text-sm font-medium text-secondary block">
                                                Password
                                            </label>
                                            <div className="relative">
                                                <div
                                                    className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <KeyRound className="h-5 w-5 text-gray-400"/>
                                                </div>
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    id="password"
                                                    required
                                                    className="input w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-colors"
                                                    placeholder="••••••••"
                                                    name="password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600"/>
                                                    ) : (
                                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600"/>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="btn btn-primary w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? (
                                                <div
                                                    className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                                            ) : (
                                                'Sign in'
                                            )}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </>
                        )}
                    </>
                );
                }

         export default Login;
