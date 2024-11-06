import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import AxiosInstance from '../../utils/AxiosInstance';
import ErrorAlert from '../../components/ErrorAlert';
import CommunityPost from '../../components/community/CommunityPost';

const ActivitiesDisplay = ({ activeTab }) => {
    const { isAuthenticated, user, error } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [Error, setError] = useState(null);

    useEffect(() => {
        const getCommunityPost = async () => {
            try {
                const response = await AxiosInstance.get(
                    `/api/community/joined/posts/`,{},{withCredentials: true}
                );
                const userPosts = response.data.filter(post => post.created_by === user.id);
                setPosts(userPosts);
            } catch (error) {
                setError(`Error fetching posts: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated()) {
            getCommunityPost();
        }
    }, [isAuthenticated]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error || Error) {
        return <ErrorAlert text={error || Error} classExtensions="fixed z-50" />;
    }

    return (
        <div className="mt-4">
            {activeTab === 'overview' && (
                <div>
                    <h2 className="font-semibold">All Activities</h2>
                    {posts.length > 0 ? (
                        posts.map(post => (
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
                        <p>No activities to display.</p>
                    )}
                </div>
            )}
            {activeTab === 'posts' && (
                <div>
                    <h2 className="font-semibold">User's Posts</h2>
                    {posts.length > 0 ? (
                        posts.map(post => (
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
            {/* Additional tabs for comments, saved posts, and liked posts can be added similarly */}
        </div>
    );
};

export default ActivitiesDisplay;
