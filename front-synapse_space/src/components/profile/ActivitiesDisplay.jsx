import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import AxiosInstance from "../../utils/AxiosInstance";
import ErrorAlert from "../../components/ErrorAlert";
import CommunityPost from "../../components/community/CommunityPost";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll"; // Assuming you have this hook
import { format } from "date-fns";

const ActivitiesDisplay = ({ activeTab, navigateToPost, userID }) => {
    const { isAuthenticated, user, error } = useContext(AuthContext);

    const [likedPosts, setLikedPosts] = useState([]);
    const [dislikedPosts, setDislikedPosts] = useState([]);
    const [loadingLikedPosts, setLoadingLikedPosts] = useState(false);

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

    const fetchLikedPosts = async (userId) => {
        setLoadingLikedPosts(true);
        try {
            const response = await AxiosInstance.get(`api/activities/${userId}`, {
                withCredentials: true,
            });
            if (response.data.liked_posts) {
                setLikedPosts(response.data.liked_posts);
            }
            if (response.data.disliked_posts) {
                setDislikedPosts(response.data.disliked_posts);
            }
        } catch (error) {
            console.error("Error fetching liked posts:", error);
        } finally {
            setLoadingLikedPosts(false);
        }
    };

    // Infinite scroll logic (existing)
    const { loading, items: posts, hasMore, loadMore, error: scrollError } = useInfiniteScroll(fetchPosts);

    // Handle scrolling
    useEffect(() => {
        if (activeTab === "posts") {
            const handleScroll = () => {
                if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
                    loadMore();
                }
            };

            window.addEventListener("scroll", handleScroll);
            return () => window.removeEventListener("scroll", handleScroll);
        }

    }, [loadMore]);

    // Fetch user comments when "comments" tab is active
    useEffect(() => {
        if (activeTab === "comments") {
            fetchUserComments(user.id).then((data) =>
                setUserComments(
                    data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Sort latest to oldest
                )
            );
        }
    }, [activeTab, user.id]);

    // Fetch liked posts when the "liked" tab is active
    useEffect(() => {
        if (activeTab === "liked" || activeTab === "disliked") {
            fetchLikedPosts(userID);
        }
    }, [activeTab, userID]);

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
    const userPosts = posts.filter((post) => post.created_by === userID);

    return (
        <div className="mt-4">

            {activeTab === "posts" && (
                <div>
                    <h2 className="font-semibold">User's Posts</h2>
                    {userPosts.length > 0 && (
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
                                createdAt={post.created_at}
                            />
                        ))
                    )}

                </div>
            )}

            {activeTab === "comments" && (
                <div>
                    <h2 className="mb-4 font-semibold text-accent dark:text-white">Your Comments</h2>
                    {userComments.length > 0 ? (
                        userComments.map((comment) => (
                            <div
                                key={comment.id}
                                className={`w-full my-3 p-3 border border-solid shadow-xl card card-compact border-white`}
                                style={{
                                    backgroundColor: 'var(--daisyui-base-100)', // Dynamic background color
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Maintain shadow
                                }}
                            >
                                <div className="flex flex-col">
                                    {/* Post Title */}
                                    <p className="text-lg font-bold text-black dark:text-white">{comment.post_title}</p>

                                    {/* Created At Timestamp */}
                                    <span className="text-sm text-gray-500 dark:text-gray-300">
                                        {comment.created_at
                                            ? format(
                                                new Date(comment.created_at),
                                                "eeee, MMMM dd yyyy hh:mm:ss a"
                                            )
                                            : ""}
                                    </span>
                                </div>
                                <br />
                                {/* Community Name */}
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                    Community: {comment.post_community}
                                </p>

                                {/* Comment Content Link */}
                                <Link
                                    to={`/community/${comment.post_community_id}/post/${comment.post_id}#comment-${comment.id}`}
                                    className="mt-2 text-gray-800 dark:text-white no-underline hover:text-[#22c0bd]" // Hover effect
                                >
                                    {comment.content}
                                </Link>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-800 dark:text-white">No comments to display.</p>
                    )}
                </div>
            )}


            {activeTab === "liked" && (
                <div>
                    <h2 className="font-semibold">User's Posts</h2>
                    {likedPosts.length > 0 && (
                        likedPosts.map((post) => (
                            <CommunityPost
                                key={post.id}
                                userName={post.created_by_username}
                                community={post.posted_in}
                                postTitle={post.title}
                                postContent={post.content}
                                postId={post.id}
                                userID={userID}
                                userAvatar={post.userAvatar}
                                createdAt={post.created_at}
                            />
                        ))
                    )}

                </div>
            )}
            {activeTab === "disliked" && (
                <div>
                    <h2 className="font-semibold">User's Posts</h2>
                    {dislikedPosts.length > 0 && (
                        dislikedPosts.map((post) => (
                            <CommunityPost
                                key={post.id}
                                userName={post.created_by_username}
                                community={post.posted_in}
                                postTitle={post.title}
                                postContent={post.content}
                                postId={post.id}
                                userID={userID}
                                userAvatar={post.userAvatar}
                                createdAt={post.created_at}
                            />
                        ))
                    )}

                </div>
            )}
            {loading && <div className="loading loading-spinner loading-lg"></div>}
            {!hasMore && <div className="mt-4 text-center">No more posts to load</div>}
        </div>
    );
};

export default ActivitiesDisplay;
