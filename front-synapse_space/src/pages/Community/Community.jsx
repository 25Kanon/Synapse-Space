import React, { useContext, useState, useEffect, useCallback } from "react";
import { useParams } from 'react-router-dom';
import AuthContext from "../../context/AuthContext";
import AxiosInstance from "../../utils/AxiosInstance";
import ErrorAlert from "../../components/ErrorAlert";
import Layout from "../../components/Layout";
import Banner from '../../components/community/Banner';
import CommunityPost from "../../components/community/CommunityPost";
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import CreateContent from "../../components/community/CreateContent";
import JoinCommuinityBtn from "../../components/community/JoinCommuinityBtn";
import { Helmet } from "react-helmet";

export default function Community() {
    const { user, error: authError } = useContext(AuthContext);
    const { id } = useParams();
    const [isMember, setIsMember] = useState(false);
    const [communityDetails, setCommunityDetails] = useState(null);
    const [error, setError] = useState(null);
    const [postCreated, setPostCreated] = useState(false);

    // Fetch community details
    useEffect(() => {
        const fetchCommunityDetails = async () => {
            try {
                const response = await AxiosInstance.get(`/api/community/${id}`, { withCredentials: true });
                setCommunityDetails(response.data);
                setIsMember(true); // Adjust based on your API response
            } catch (err) {
                setError(`Failed to load community details. ${err.response?.data?.detail || err.message}`);
                setIsMember(false);
            }
        };
        if (id) fetchCommunityDetails();
    }, [id]); // Refetch on `postCreated` change

    // Fetch posts with infinite scroll
    const fetchCommunityPosts = useCallback(async (page) => {
        try {
            const response = await AxiosInstance.get(`/api/community/${id}/posts/?page=${page}`, { withCredentials: true });
            return response;
        } catch (err) {
            console.error(err);
            throw new Error("Failed to load posts.");
        }
    }, [id]);

    const {
        loading,
        items: communityPosts,
        hasMore,
        loadMore,
        error: scrollError
    } = useInfiniteScroll(fetchCommunityPosts, [id, postCreated]); // Refetch posts on `postCreated` change

    // Infinite scroll event listener
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
                loadMore();
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [loadMore]);

    if (!user) {
        return (
            <div className="min-h-screen hero bg-base-200">
                <p className="text-xl text-center">Welcome to Synapse Space. Please login to continue.</p>
            </div>
        );
    }

    if (!isMember) {
        return (
            <>
                <Helmet>
                    <title>{communityDetails?.name || "Community"} - Synapse Space</title>
                </Helmet>
                {authError && <ErrorAlert text={authError} />}
                <Layout showSidebar membersListId={id}>
                    <Banner
                        communityName={communityDetails?.name}
                        commBanner={communityDetails?.bannerURL}
                        commAvatar={communityDetails?.imgURL}
                        communityID={communityDetails?.id}
                    />
                    <div className="flex flex-col items-start mx-10">
                        <JoinCommuinityBtn communityId={communityDetails?.id} />
                        <article className="prose">
                            <h2>About {communityDetails?.name}</h2>
                            <p>{communityDetails?.description}</p>
                        </article>
                        <div className="divider" />
                        <article className="prose">
                            <h2>Rules</h2>
                            <p>{communityDetails?.rules}</p>
                        </article>
                    </div>
                </Layout>
            </>
        );
    }

    return (
        <>
            <Helmet>
                <title>{communityDetails?.name || "Community"} - Synapse Space</title>
            </Helmet>
            {(scrollError || error) && <ErrorAlert text={scrollError || error} />}
            <Layout showSidebar membersListId={id}>
                <Banner
                    communityName={communityDetails?.name}
                    commBanner={communityDetails?.bannerURL}
                    commAvatar={communityDetails?.imgURL}
                    communityID={communityDetails?.id}
                />
                <CreateContent
                    userName={user.username}
                    community={communityDetails?.id}
                    rules={communityDetails?.rules}
                    onPostCreated={() => setPostCreated((prev) => !prev)} // Toggle postCreated to refresh data
                />
                {communityPosts.map((post) => (
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
                        isPinnedInit={post.isPinned}
                        createdAt={post.created_at}
                    />
                ))}
                {loading && <div className="text-center">
                    <div className="loading loading-spinner loading-lg"></div>
                </div>}
                {!hasMore && <div className="mt-4 text-center">No more posts to load</div>}
            </Layout>
        </>
    );
}
