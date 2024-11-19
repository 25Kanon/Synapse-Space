import React, { useContext, useEffect, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import ErrorAlert from "../components/ErrorAlert";
import Sidebar from "../components/Sidebar";
import NavBar from "../components/NavBar";
import FriendsList from "../components/FriendsList";
import MainContentContainer from "../components/MainContentContainer";
import AxiosInstance from "../utils/AxiosInstance";

export default function Settings() {
    const { user, authError } = useContext(AuthContext);
    const [theme, setTheme] = React.useState('dark');
    const [notifications, setNotifications] = React.useState(true);
    const [feedback, setFeedback] = React.useState('');
    const [showDeactivateModal, setShowDeactivateModal] = React.useState(false);

    const handleThemeChange = (e) => {
        const newTheme = e.target.checked ? 'dark' : 'light';
    try {
        await AxiosInstance.put('/api/user/settings/update/', {
            theme: newTheme
        });
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    } catch (error) {
        console.error('Error updating theme:', error);
    }
};

    const handleNotificationChange = (e) => {
        try {
            await AxiosInstance.put('/api/user/settings/update/', {
                notifications_enabled: e.target.checked
            });
            setNotifications(e.target.checked);
        } catch (error) {
            console.error('Error updating notifications:', error);
        }
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        try {
            await AxiosInstance.post('/feedback', { feedback });
            setFeedback('');
            alert('Feedback submitted successfully!');
        } catch (error) {
            console.error('Error submitting feedback:', error);
        }
    };

    const handleDeactivateAccount = async () => {
        if (window.confirm('Are you sure you want to deactivate your account?')) {
            try {
                await AxiosInstance.post('/api/user/deactivate/');
                // Handle logout and redirect
            } catch (error) {
                console.error('Error deactivating account:', error);
            }
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to permanently delete your account? This cannot be undone.')) {
            try {
                await AxiosInstance.delete('/user/delete');
                // Handle logout and redirect
            } catch (error) {
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
            {authError && 
                <ErrorAlert text={authError} classExtensions="fixed z-50" />
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
                            <div className="flex gap-4">
                                <button 
                                    onClick={handleFeedbackSubmit} 
                                    className="btn btn-primary"
                                >
                                    Submit Feedback
                                </button>
                                <a 
                                    href={`mailto:synapsespacecapstone@gmail.com?subject=Feedback from ${user.username}&body=${feedback}`}
                                    className="btn btn-secondary"
                                >
                                    Send via Email
                                </a>
                            </div>
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