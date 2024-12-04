import React, { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import AxiosInstance from "../../utils/AxiosInstance";
import ErrorAlert from "../../components/ErrorAlert";
import Layout from "../../components/Layout";
import Banner from "../../components/community/Banner";
import CommunityPost from "../../components/community/CommunityPost";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import CreateContent from "../../components/community/CreateContent";
import JoinCommuinityBtn from "../../components/community/JoinCommuinityBtn";
import {ActivityFeedCard} from "../../components/community/ActivityFeedCard"
import { Helmet } from "react-helmet";
import {useMemberships} from "../../context/MembershipContext";

export default function Community() {
    const { user } = useContext(AuthContext);
    const { memberships } = useMemberships();
    const { id } = useParams();
    const [isMember, setIsMember] = useState(false);
    const [communityDetails, setCommunityDetails] = useState(null);
    const [error, setError] = useState(null);
    const [postCreated, setPostCreated] = useState(false);
    const [activitiesCreated, setActivitiesCreated] = useState(false);
    const [membership, setMembership] = useState({});


    const findMembership = async () => {
        const foundMembership = await memberships.find((membership) => parseInt(membership.community) === parseInt(id));
        console.log("Found membership:", memberships);
        if (foundMembership) {
            setIsMember(true);
            setMembership(foundMembership);
            console.log("Membership:", foundMembership);
        }
    };


    useEffect(() => {
        findMembership();
    }, [memberships]);


    // Fetch community details
    useEffect(() => {
        const fetchCommunityDetails = async () => {
            try {
                const response = await AxiosInstance.get(`/api/community/${id}`, { withCredentials: true });
                setCommunityDetails(response.data);
            } catch (err) {
                setError(`Failed to load community details. ${err.response?.data?.detail || err.message}`);
            }
        };
        if (id) {
            fetchCommunityDetails();
        }
    }, [id]);

    // Fetch posts
    const fetchCommunityPosts = async (page) => {
        const response = await AxiosInstance.get(`/api/community/${id}/posts/?page=${page}`, { withCredentials: true });
        console.log("Posts API Response:", response.data);
        return response;
    };

    // Fetch activities
    const fetchCommunityActivities = async (page) => {
        const response = await AxiosInstance.get(`/api/community/${id}/activities/?page=${page}`, { withCredentials: true });
        return response;
    };

    // Infinite scroll for posts
    const {
        loading: postsLoading,
        items: communityPosts,
        hasMore: postsHasMore,
        loadMore: loadMorePosts,
        error: postsError,
    } = useInfiniteScroll(fetchCommunityPosts, [id, postCreated]);

    // Infinite scroll for activities
    const {
        loading: activitiesLoading,
        items: communityActivities,
        hasMore: activitiesHasMore,
        loadMore: loadMoreActivities,
        error: activitiesError,
    } = useInfiniteScroll(fetchCommunityActivities, [id, activitiesCreated]);

    // Initial data fetch for posts and activities
    useEffect(() => {
        if (communityPosts.length === 0) {
            loadMorePosts();
        }
    }, [communityPosts, loadMorePosts]);

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

                <Layout showSidebar membersListId={id}>
                    {error && <ErrorAlert text={error} classExtensions={"z-50"}/>}
                    <Banner
                        communityName={communityDetails?.name}
                        commBanner={communityDetails?.bannerURL}
                        commAvatar={communityDetails?.imgURL}
                        communityID={communityDetails?.id}
                        communityPrivacy={communityDetails?.privacy}
                    />
                    <div className="flex flex-col items-start mx-10">
                        <JoinCommuinityBtn communityId={communityDetails?.id}/>
                        <article className="prose">
                            <h2>About {communityDetails?.name}</h2>
                            <p>{communityDetails?.description}</p>
                        </article>
                        <div className="divider"/>
                        <article className="prose">
                            <h2>Rules</h2>
                            <p>{communityDetails?.rules}</p>
                        </article>
                    </div>

                    {communityDetails?.privacy === "public" &&
                        <>
                            <div className="divider mx-10"/>
                            <div role="tablist" className="tabs tabs-lifted tabs-lg m-3">
                                <input
                                    type="radio"
                                    name="community_tabs"
                                    role="tab"
                                    className="tab"
                                    aria-label="Posts"
                                    defaultChecked
                                />
                                <div role="tabpanel" className="tab-content bg-base-100 p-6 border rounded-box">
                                    <>
                                        {communityPosts.length > 0 ? (
                                            communityPosts.map((post) => (
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
                                                    postStatus={post.status} // Allow interaction if post is approved
                                                />
                                            ))
                                        ) : (
                                            <div className="text-center">No posts to display</div>
                                        )}
                                        {postsLoading && (
                                            <div className="text-center">
                                                <div className="loading loading-spinner loading-lg"></div>
                                            </div>
                                        )}
                                        {!postsHasMore && communityPosts.length > 0 && (
                                            <div className="mt-4 text-center">No more posts to load</div>
                                        )}
                                    </>
                                </div>

                                <input type="radio" name="community_tabs" role="tab" className="tab"
                                       aria-label="Activities"/>
                                <div role="tabpanel" className="tab-content bg-base-100 p-6 border rounded-box">
                                    <>
                                        {communityActivities.length > 0 ? (
                                            communityActivities.map((activity) => (
                                                <ActivityFeedCard key={`activity-${activity.id}`} activity={activity}/>
                                            ))
                                        ) : (
                                            <div className="text-center">No activities to display</div>
                                        )}
                                        {activitiesLoading && (
                                            <div className="text-center">
                                                <div className="loading loading-spinner loading-lg"></div>
                                            </div>
                                        )}
                                        {!activitiesHasMore && communityActivities.length > 0 && (
                                            <div className="mt-4 text-center">No more activities to load</div>
                                        )}
                                    </>
                                </div>
                            </div>
                        </>
                    }

                </Layout>
            </>
        );
    } else {
        return (
            <>
                <Helmet>
                    <title>{communityDetails?.name || "Community"} - Synapse Space</title>
                </Helmet>

                <Layout showSidebar membersListId={id}>
                    {(postsError || activitiesError || error) &&
                        <ErrorAlert text={postsError || activitiesError || error}/>}
                    <Banner
                        communityName={communityDetails?.name}
                        commBanner={communityDetails?.bannerURL}
                        commAvatar={communityDetails?.imgURL}
                        communityID={communityDetails?.id}
                        communityPrivacy={communityDetails?.privacy}
                    />
                    <CreateContent
                        userName={user.username}
                        community={communityDetails?.id}
                        rules={communityDetails?.rules}
                        onPostCreated={() => setPostCreated((prev) => !prev)}
                        onActivityCreated={() => setActivitiesCreated((prev) => !prev)}
                    />
                    <div role="tablist" className="tabs tabs-lifted tabs-lg m-3">
                        <input
                            type="radio"
                            name="community_tabs"
                            role="tab"
                            className="tab"
                            aria-label="Posts"
                            defaultChecked
                        />
                        <div role="tabpanel" className="tab-content bg-base-100 p-6 border rounded-box">
                            <>
                                {communityPosts.length > 0 ? (
                                    communityPosts.map((post) => (
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
                                            postStatus={post.status} // Allow interaction if post is approved
                                        />
                                    ))
                                ) : (
                                    <div className="text-center">No posts to display</div>
                                )}
                                {postsLoading && (
                                    <div className="text-center">
                                        <div className="loading loading-spinner loading-lg"></div>
                                    </div>
                                )}
                                {!postsHasMore && communityPosts.length > 0 && (
                                    <div className="mt-4 text-center">No more posts to load</div>
                                )}
                            </>
                        </div>

                        <input type="radio" name="community_tabs" role="tab" className="tab" aria-label="Activities"/>
                        <div role="tabpanel" className="tab-content bg-base-100 p-6 border rounded-box">
                            <>
                                {communityActivities.length > 0 ? (
                                    communityActivities.map((activity) => (
                                        <ActivityFeedCard key={`activity-${activity.id}`} activity={activity} />
                                    ))
                                ) : (
                                    <div className="text-center">No activities to display</div>
                                )}
                                {activitiesLoading && (
                                    <div className="text-center">
                                        <div className="loading loading-spinner loading-lg"></div>
                                    </div>
                                )}
                                {!activitiesHasMore && communityActivities.length > 0 && (
                                    <div className="mt-4 text-center">No more activities to load</div>
                                )}
                            </>
                        </div>
                    </div>
                </Layout>
            </>
        );
    }
}
