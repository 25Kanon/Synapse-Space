import React from 'react';

const ProfileTabs = ({ activeTab, setActiveTab }) => {
    return (
        <div className="mt-8 tabs">
            <button className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
            <button className={`tab ${activeTab === 'posts' ? 'tab-active' : ''}`} onClick={() => setActiveTab('posts')}>Posts</button>
            <button className={`tab ${activeTab === 'comments' ? 'tab-active' : ''}`} onClick={() => setActiveTab('comments')}>Comments</button>
            <button className={`tab ${activeTab === 'liked' ? 'tab-active' : ''}`} onClick={() => setActiveTab('liked')}>Liked Posts</button>
        </div>
    );
};

export default ProfileTabs;
