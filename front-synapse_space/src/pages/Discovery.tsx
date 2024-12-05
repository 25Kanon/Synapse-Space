import React, { useContext, useEffect, useState } from "react";
import 'tailwindcss/tailwind.css';
import 'daisyui';
import { AuthContext } from "../context/AuthContext";
import ErrorAlert from "../components/ErrorAlert";
import AxiosInstance from "../utils/AxiosInstance";
import { useMemberships } from "../context/MembershipContext";
import CommunityCard from "../components/search/CommunityCard";
import Loading from "../components/Loading";
import FriendsList from "../components/FriendsList"; // Import FriendsList
import Layout from "../components/Layout";
import {Helmet} from "react-helmet-async"; // Import Layout

export default function Discovery() {
    const [loading, setLoading] = useState(true);
    const [recommendations, setRecommendations] = useState(null);
    const [Error, setError] = useState(null);
    const { memberships } = useMemberships();

    useEffect(() => {
        setLoading(true);
        console.log("getting recommendations");
        const getRecommendations = async () => {
            try {
                const response = await AxiosInstance.get(
                    `/api/recommendations/`, {}, { withCredentials: true }
                );
                setRecommendations(response.data.recommended_communities);
                setLoading(false);
            } catch (error) {
                console.log(error);
                setError(`Error fetching post: ${error.message}`);
                setLoading(false);
            }
        };

        getRecommendations();
    }, []);

    const getInitials = (name) => {
        if (!name) return '';
        return name.split(' ').map(word => word[0]).join('');
    };

    // Separate communities based on the reason
    const recommendedForYou = recommendations?.filter(community => community.reason !== "Popular among users like you");
    const popularCommunities = recommendations?.filter(community => community.reason === "Popular among users like you");

    return (
        <Layout showSidebar={true}> {/* Wrap everything inside Layout */}
            <Helmet>
                <title>Discovery - Synapse Space</title>
            </Helmet>
            {Error && <ErrorAlert text={Error} classExtensions="fixed z-50" />}
            <FriendsList /> {/* Add FriendsList */}
            <div className="flex flex-col justify-between p-5">
                {/* Only show "Recommended For You" heading if there are recommendations */}
                {!loading && recommendedForYou?.length > 0 && (
                    <div className="flex flex-col justify-start">
                        <p>
                            <h5 className="text-2xl font-bold">Recommended For You</h5>
                        </p>
                        <p>
                            <h5 className="text-sm font-medium">
                                Recommended based on your interest
                            </h5>
                            <sup>Includes searches and visits</sup>
                        </p>
                        <p>

                        </p>
                    </div>
                )}

                <div className="flex flex-wrap justify-start">
                    {loading && <div className="flex justify-center w-full mx-auto"><Loading loadingText="Generating Recommendations" /></div>}
                    {recommendedForYou?.map((community, index) => {
                        const isJoined = memberships.some(
                            (membership) => membership.community === community.id
                        );
                        return (
                            <CommunityCard
                                key={index}
                                community={community}
                                getInitials={getInitials}
                                isJoined={isJoined}
                            />
                        );
                    })}
                </div>

                {/* Only show "Popular Communities Among Users Like You" heading if there are popular communities */}
                {!loading && popularCommunities?.length > 0 && (
                    <div className="flex flex-col justify-start mt-10">
                        <h5 className="text-2xl font-bold">Popular Communities Among Users Like You</h5>
                    </div>
                )}

                <div className="flex flex-wrap justify-start">
                    {popularCommunities?.map((community, index) => {
                        const isJoined = memberships.some(
                            (membership) => membership.community === community.id
                        );
                        return (
                            <CommunityCard
                                key={index}
                                community={community}
                                getInitials={getInitials}
                                isJoined={isJoined}
                            />
                        );
                    })}
                </div>
            </div>
        </Layout>
    );
}
