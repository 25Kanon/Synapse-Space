import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import AxiosInstance from '../../utils/AxiosInstance';
import ErrorAlert from '../../components/ErrorAlert';
import CommunityPost from '../../components/community/CommunityPost';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';  // Assuming you have this hook

const ActivitiesDisplay = ({ activeTab }) => {
    const { isAuthenticated, user, error } = useContext(AuthContext);

    const fetchPosts = async (page) => {
        return await AxiosInstance.get(`/api/community/joined/posts/?page=${page}`,
            {}, 
            { withCredentials: true }
        );
    };

    const { 
        loading, 
        items: posts, 
        hasMore, 
        loadMore, 
        error: scrollError 
    } = useInfiniteScroll(fetchPosts);

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
                loadMore();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loadMore]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error || scrollError) {
        return <ErrorAlert text={error || scrollError} classExtensions="fixed z-50" />;
    }

    const userPosts = posts.filter(post => post.created_by === user.id);

    return (
        <div className="mt-4">
            {activeTab === 'overview' && (
                <div>
                    <h2 className="font-semibold">All Activities</h2>
                    {userPosts.length > 0 ? (
                        userPosts.map(post => (
                            <CommunityPost
                                key={post.id}
                                userName={post.created_by_username}
                                community={post.posted_in}
                                postTitle={post.title}
                                postContent={post.content}
                                postId={post.id}
                                userID={post.created_by}
                                userAvatar={post.userAvatar}
                            />
                        ))
                    ) : (
                        <p>No activities to display.</p>
                    )}
                </div>
            )}

            {activeTab === 'posts' && (
                <div>
                    <h2 className="font-semibold">User's Posts</h2>
                    {userPosts.length > 0 ? (
                        userPosts.map(post => (
                            <CommunityPost
                                key={post.id}
                                userName={post.created_by_username}
                                community={post.posted_in}
                                postTitle={post.title}
                                postContent={post.content}
                                postId={post.id}
                                userID={post.created_by}
                                userAvatar={post.userAvatar}
                            />
                        ))
                    ) : (
                        <p>No posts to display.</p>
                    )}
                </div>
            )}
            
            {loading && <div className="loading loading-spinner loading-lg"></div>}
            {!hasMore && <div className="mt-4 text-center">No more posts to load</div>}
        </div>
    );
};

export default ActivitiesDisplay;
