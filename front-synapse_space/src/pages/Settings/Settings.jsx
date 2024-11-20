import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import ErrorAlert from "../../components/ErrorAlert";
import Sidebar from "../../components/Sidebar";
import NavBar from "../../components/NavBar";
import MainContentContainer from "../../components/MainContentContainer";
import AxiosInstance from "../../utils/AxiosInstance";

export default function Settings() {
    const { user, authError } = useContext(AuthContext);
    const [theme, setTheme] = useState('dark');
    const [notifications, setNotifications] = useState(true);
    const [feedback, setFeedback] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleThemeChange = async (e) => {
        const newTheme = e.target.checked ? 'dark' : 'light';
        try {
            await AxiosInstance.put('/api/user/settings/update/', {
                theme: newTheme
            });
            setTheme(newTheme);
            document.documentElement.setAttribute('data-theme', newTheme);
            setSuccess('Theme updated successfully');
        } catch (error) {
            setError('Error updating theme');
            console.error('Error updating theme:', error);
        }
    };

    const handleNotificationChange = async (e) => {
        try {
            await AxiosInstance.put('/api/user/settings/update/', {
                notifications_enabled: e.target.checked
            });
            setNotifications(e.target.checked);
            setSuccess('Notifications updated successfully');
        } catch (error) {
            setError('Error updating notifications');
            console.error('Error updating notifications:', error);
        }
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        try {
            await AxiosInstance.post('/api/feedback/', { feedback });
            setFeedback('');
            setSuccess('Feedback submitted successfully');
        } catch (error) {
            setError('Error submitting feedback');
            console.error('Error submitting feedback:', error);
        }
    };

    const handleDeactivateAccount = async () => {
        if (window.confirm('Are you sure you want to deactivate your account?')) {
            try {
                await AxiosInstance.post('/api/user/deactivate/');
                window.location.href = '/login';
            } catch (error) {
                setError('Error deactivating account');
                console.error('Error deactivating account:', error);
            }
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to permanently delete your account? This cannot be undone.')) {
            try {
                await AxiosInstance.delete('/api/user/delete');
                window.location.href = '/login';
            } catch (error) {
                setError('Error deleting account');
                console.error('Error deleting account:', error);
            }
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen hero bg-base-200">
                <p className="text-xl text-center">
                    Welcome to Synapse Space. Please login to continue.
                </p>
            </div>
        );
    }

    return (
        <>
            {(authError || error) && 
                <ErrorAlert text={authError || error} classExtensions="fixed z-50" />
            }
            {success && 
                <div className="alert alert-success fixed top-4 right-4 z-50">
                    <span>{success}</span>
                </div>
            }
            <NavBar />
            <Sidebar />
            <MainContentContainer>
                <div className="p-6 space-y-6">
                    <h2 className="text-2xl font-bold">Settings</h2>
                    
                    <section className="space-y-4">
                        <h3 className="text-xl font-semibold">Theme</h3>
                        <div className="form-control">
                            <label className="cursor-pointer label">
                                <span className="label-text">Dark Mode</span>
                                <input 
                                    type="checkbox" 
                                    className="toggle toggle-primary" 
                                    checked={theme === 'dark'}
                                    onChange={handleThemeChange}
                                />
                            </label>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-xl font-semibold">Notifications</h3>
                        <div className="form-control">
                            <label className="cursor-pointer label">
                                <span className="label-text">Enable Notifications</span>
                                <input 
                                    type="checkbox" 
                                    className="toggle toggle-primary"
                                    checked={notifications}
                                    onChange={handleNotificationChange}
                                />
                            </label>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-xl font-semibold">Feedback</h3>
                        <div className="space-y-4">
                            <textarea 
                                className="w-full textarea textarea-bordered"
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Share your thoughts with us..."
                                rows="4"
                            />
                            <button 
                                onClick={handleFeedbackSubmit} 
                                className="btn btn-primary"
                            >
                                Submit Feedback
                            </button>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-xl font-semibold">Account Management</h3>
                        <div className="space-y-2">
                            <button 
                                onClick={handleDeactivateAccount}
                                className="w-full btn btn-warning"
                            >
                                Deactivate Account
                            </button>
                            <button 
                                onClick={handleDeleteAccount}
                                className="w-full btn btn-error"
                            >
                                Delete Account Permanently
                            </button>
                        </div>
                    </section>
                </div>
            </MainContentContainer>
        </>
    );
}