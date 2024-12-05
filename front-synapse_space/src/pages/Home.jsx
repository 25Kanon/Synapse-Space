import React, { useContext, useEffect, useCallback, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import ErrorAlert from "../components/ErrorAlert";
import Sidebar from "../components/Sidebar";
import NavBar from "../components/NavBar";
import FriendsList from "../components/FriendsList";
import MainContentContainer from "../components/MainContentContainer";
import AxiosInstance from "../utils/AxiosInstance";
import CommunityPost from "../components/community/CommunityPost";
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import Footer from '../components/Footer';
import { Helmet } from "react-helmet";
import { ActivityFeedCard } from "../components/community/ActivityFeedCard";

export default function Home() {
    const { isAuthenticated, user, error: authError } = useContext(AuthContext);

    // State for active tab
    const [activeTab, setActiveTab] = useState("posts"); // "posts" or "activities"

    const fetchPosts = useCallback(async (page) => {
        return await AxiosInstance.get(`/api/recommendations/combined-posts/?page=${page}`,
            {},
            { withCredentials: true }
        );
    }, []);

    const fetchActivities = useCallback(async (page) => {
        return await AxiosInstance.get(`/api/recommendations/combined-activities/?page=${page}`,
            {},
            { withCredentials: true }
        );
    }, []);

    const {
        loading: postsLoading,
        items: feedPosts,
        hasMore: postsHasMore,
        loadMore: loadMorePosts,
        error: postsError
    } = useInfiniteScroll(fetchPosts);

    const {
        loading: activitiesLoading,
        items: feedActivities,
        hasMore: activitiesHasMore,
        loadMore: loadMoreActivities,
        error: activitiesError
    } = useInfiniteScroll(fetchActivities);

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
                if (activeTab === "posts") {
                    loadMorePosts();
                } else if (activeTab === "activities") {
                    loadMoreActivities();
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loadMorePosts, loadMoreActivities, activeTab]);

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
            <Helmet>
                <title>Home - Synapse Space</title>
            </Helmet>
            {(authError || postsError || activitiesError) &&
                <ErrorAlert
                    text={authError || postsError || activitiesError}
                    classExtensions="fixed z-50"
                />
            }
            <NavBar />
            <Sidebar />
            <FriendsList />

            <MainContentContainer>
                {/* Tab Navigation */}
                <div className="tabs tabs-lifted">
                    <a
                        className={`tab tab-lifted ${activeTab === "posts" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("posts")}
                    >
                        Community Posts
                    </a>
                    <a
                        className={`tab tab-lifted ${activeTab === "activities" ? "tab-active " : ""}`}
                        onClick={() => setActiveTab("activities")}
                    >
                        Activities
                    </a>
                </div>

                {/* Indicator for active tab */}
                <div className="tab-indicator">
                    {activeTab === "posts" && <div className="indicator posts-indicator"></div>}
                    {activeTab === "activities" && <div className="indicator activities-indicator"></div>}
                </div>

                {/* Content Based on Active Tab */}
                {activeTab === "posts" && (
                    <div>
                        {/* Render community posts */}
                        {feedPosts?.map((post) => (
                            <CommunityPost
                                key={post.id}
                                userName={post.created_by_username}
                                community={post.posted_in}
                                postTitle={post.title}
                                postContent={post.content}
                                postId={post.id}
                                userID={user.id}
                                authorId={post.created_by}
                                userAvatar={post.userAvatar}
                                createdAt={post.created_at}
                                postStatus={post.status}
                            />
                        ))}
                        {postsLoading && <div className="loading loading-spinner loading-lg"></div>}
                        {!postsHasMore && <div className="mt-4 text-center">No more posts to load</div>}
                    </div>
                )}

                {activeTab === "activities" && (
                    <div>
                        {/* Render activities */}
                        {feedActivities?.map((activity) => (
                            <ActivityFeedCard key={activity.id} activity={activity} />
                        ))}
                        {activitiesLoading && <div className="loading loading-spinner loading-lg"></div>}
                        {!activitiesHasMore && <div className="mt-4 text-center">No more activities to load</div>}
                    </div>
                )}
            </MainContentContainer>

            <Footer />
        </>
    );
}