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
import Layout from "../components/Layout"; // Import Layout

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

    console.log(recommendations);

    return (
        <Layout showSidebar={true}> {/* Wrap everything inside Layout */}
            {Error && <ErrorAlert text={Error} classExtensions="fixed z-50" />}
            <FriendsList /> {/* Add FriendsList */}
            <div className="flex flex-col justify-between p-5">
                {!loading && (
                    <div className="flex flex-col justify-start">
                        <p>
                            <h5 className="text-2xl font-bold">Recommended For You</h5>
                        </p>
                        <p>
                            <h5 className="text-sm font-medium">
                                Recommended by Hybrid Recommender based on your interest
                            </h5>
                        </p>
                    </div>
                )}
                <div className="flex flex-wrap justify-center">
                    {loading && <Loading loadingText="Generating Recommendations" />}
                    {recommendations?.map((community, index) => {
                        // Check if the community ID is in memberships
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
