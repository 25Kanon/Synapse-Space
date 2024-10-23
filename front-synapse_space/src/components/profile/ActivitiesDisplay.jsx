import React from 'react';

const ActivitiesDisplay = ({ activities, activeTab }) => {
    return (
        <div className="mt-4">
            {activeTab === 'overview' && (
                <div>
                    <h2 className="font-semibold">All Activities</h2>
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
            {/* Handle other tabs for comments, saved posts, and liked posts */}
        </div>
    );
};

export default ActivitiesDisplay;
