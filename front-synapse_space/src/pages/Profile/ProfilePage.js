import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'tailwindcss/tailwind.css';
import 'daisyui';

const ProfilePage = () => {
    const [userProfile, setUserProfile] = useState({});
    const [activities, setActivities] = useState({});
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        // Fetch user profile
        axios.get(`${process.env.REACT_APP_API_BASE_URI}/api/profile/`)
            .then(response => setUserProfile(response.data))
            .catch(error => console.error(error));

        // Fetch user activities
        axios.get(`${process.env.REACT_APP_API_BASE_URI}/api/activities/`)
            .then(response => setActivities(response.data))
            .catch(error => console.error(error));
    }, []);

    return (
        <div className="p-6">
            {/* Profile Header */}
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <img
                        src={userProfile.profile_picture}
                        alt="Profile"
                        className="w-24 h-24 rounded-full"
                    />
                    <button className="absolute bottom-0 right-0 p-2 bg-gray-300 rounded-full">
                        <i className="fa fa-camera"></i>
                    </button>
                </div>
                <div>
                    <h1 className="text-2xl font-bold">{userProfile.first_name} {userProfile.last_name}</h1>
                </div>
            </div>

            {/* Create Post Button */}
            <div className="mt-6">
                <button className="btn btn-primary" onClick={() => {/* Open Modal Logic */}}>
                    Create Post
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="mt-8 tabs">
                <button className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
                <button className={`tab ${activeTab === 'posts' ? 'tab-active' : ''}`} onClick={() => setActiveTab('posts')}>Posts</button>
                <button className={`tab ${activeTab === 'comments' ? 'tab-active' : ''}`} onClick={() => setActiveTab('comments')}>Comments</button>
                <button className={`tab ${activeTab === 'saved' ? 'tab-active' : ''}`} onClick={() => setActiveTab('saved')}>Saved Posts</button>
                <button className={`tab ${activeTab === 'liked' ? 'tab-active' : ''}`} onClick={() => setActiveTab('liked')}>Liked Posts</button>
            </div>

            {/* Activities Display */}
            <div className="mt-4">
                {activeTab === 'overview' && (
                    <div>
                        <h2 className="font-semibold">All Activities</h2>
                        {/* Display all activities */}
                        {/* Example */}
                        {activities.posts?.map(post => (
                            <div key={post.id} className="mt-2">
                                <p>{post.content}</p>
                                <small>{new Date(post.created_at).toLocaleString()}</small>
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === 'posts' && (
                    <div>
                        <h2 className="font-semibold">User's Posts</h2>
                        {activities.posts?.map(post => (
                            <div key={post.id} className="mt-2">
                                <p>{post.content}</p>
                                <small>{new Date(post.created_at).toLocaleString()}</small>
                            </div>
                        ))}
                    </div>
                )}
                {/* Other tabs similarly handle comments, saved posts, and liked posts */}
            </div>
        </div>
    );
};

export default ProfilePage; 