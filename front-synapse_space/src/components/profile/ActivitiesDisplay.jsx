import React from 'react';
import CommunityPost from '../community/CommunityPost'; // Import the CommunityPost component for consistent display

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
                    {activities.posts?.length > 0 ? (
                        activities.posts.map(post => (
                            <CommunityPost
                                key={post.id}
                                userName={post.created_by_username}
                                community={post.posted_in}
                                postTitle={post.title}
                                postContent={post.content}
                                postId={post.id}
                                userID={post.created_by}
                                userAvatar={post.userAvatar}
                                isPinned={post.isPinned}
                            />
                        ))
                    ) : (
                        <p>No posts to display.</p>
                    )}
                </div>
            )}
            {/* Additional tabs for comments, saved posts, and liked posts */}
        </div>
    );
};

export default ActivitiesDisplay;
