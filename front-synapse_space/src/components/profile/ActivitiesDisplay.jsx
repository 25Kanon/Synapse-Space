import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import AxiosInstance from "../../utils/AxiosInstance";
import ErrorAlert from "../../components/ErrorAlert";
import CommunityPost from "../../components/community/CommunityPost";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll"; // Assuming you have this hook

const ActivitiesDisplay = ({ activeTab, navigateToPost }) => {
    const { isAuthenticated, user, error } = useContext(AuthContext);

    // State for user comments
    const [userComments, setUserComments] = useState([]);

    // Fetch posts (existing logic)
    const fetchPosts = async (page) => {
        return await AxiosInstance.get(`/api/community/joined/posts/?page=${page}`, {}, { withCredentials: true });
    };

    // Fetch user comments
    const fetchUserComments = async (userId) => {
        try {
            const response = await AxiosInstance.get(`/api/comments/user/${userId}/`, {
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching user comments:", error);
            return [];
        }
    };

    // Infinite scroll logic (existing)
    const { loading, items: posts, hasMore, loadMore, error: scrollError } = useInfiniteScroll(fetchPosts);

    // Handle scrolling
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
                loadMore();
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [loadMore]);

    // Fetch user comments when "comments" tab is active
    useEffect(() => {
        if (activeTab === "comments") {
            fetchUserComments(user.id).then((data) =>
                setUserComments(
                    data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) // Sort by date
                )
            );
        }
    }, [activeTab, user.id]);

    // Handle clicking on a comment to navigate to the full post
    const handleCommentClick = (postId) => {
        if (navigateToPost) {
            navigateToPost(postId); // Function to navigate to the post detail page
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error || scrollError) {
        return <ErrorAlert text={error || scrollError} classExtensions="fixed z-50" />;
    }

    // Filter posts created by the logged-in user
    const userPosts = posts.filter((post) => post.created_by === user.id);

    return (
        <div className="mt-4">
            {activeTab === "overview" && (
                <div>
                    <h2 className="font-semibold">All Activities</h2>
                    {userPosts.length > 0 ? (
                        userPosts.map((post) => (
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

            {activeTab === "posts" && (
                <div>
                    <h2 className="font-semibold">User's Posts</h2>
                    {userPosts.length > 0 ? (
                        userPosts.map((post) => (
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

            {activeTab === "comments" && (
                <div>
                    <h2 className="mb-4 font-semibold text-black">Your Comments</h2>
                    {userComments.length > 0 ? (
                        userComments.map((comment) => (
                            <div
                                key={comment.id}
                                className="p-4 mb-4 bg-gray-100 rounded-lg hover:shadow-lg"
                            >
                                <div className="flex items-center justify-between">
                                <p className="text-lg font-bold text-black">
                                {comment.post_title}
                                </p>
                                    <span className="text-sm text-black">
                                        {new Date(comment.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-sm text-black">
                                    Community: {comment.post_community}
                                </p>
                                <Link
                                    to={`/community/${comment.post_community_id}/post/${comment.post_id}#comment-${comment.id}`} // Dynamic link to the specific comment
                                    className="mt-2 text-black no-underline hover:text-blue-500"
                                >
                                    {comment.content}
                                </Link>
                            </div>
                        ))
                    ) : (
                        <p className="text-black">No comments to display.</p>
                    )}
                </div>
            )}

            {loading && <div className="loading loading-spinner loading-lg"></div>}
            {!hasMore && <div className="mt-4 text-center">No more posts to load</div>}
        </div>
    );
};

export default ActivitiesDisplay;
