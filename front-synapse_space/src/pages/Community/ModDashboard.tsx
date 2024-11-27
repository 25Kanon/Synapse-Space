import React, { useEffect, useState } from "react";
import { Bell, Search, Shield, Users, MessageSquare, Flag } from 'lucide-react';
import { ModQueue } from "../../components/community/moderator/ModQueue";
import { ModStats } from "../../components/community/moderator/ModStats";
import { ModActions } from "../../components/community/moderator/ModActions";
import { ModSettingsModal } from "../../components/community/moderator/ModSettings";
import { useModeration } from "../../hooks/useModeration";
import { useParams } from "react-router-dom";
import AxiosInstance from "../../utils/AxiosInstance";
import ErrorAlert from "../../components/ErrorAlert";
import SuccessAlert from "../../components/SuccessAlert";
import Top10Stats from "../../components/Top10Stats";
import {Helmet} from "react-helmet-async";



function ModDashboard() {
    const { community_id } = useParams();
    const [communityDetails, setCommunityDetails] = useState("");
    const [activeTab, setActiveTab] = useState("moderation"); // Track active tab
    const [topStats, setTopStats] = useState(null);
    const [error, setError] = useState("");
    const [mostLikedPosts, setMostLikedPosts] = useState([]);
    const [mostDislikedPosts, setMostDislikedPosts] = useState([]);
    const [mostCommentedPosts, setMostCommentedPosts] = useState([]);

    const {
        reports,
        filter,
        setFilter,
        setSearchQuery,
        notifications,
        handleApprove,
        handleReject,
        stats,
        settings,
        isSettingsOpen,
        setIsSettingsOpen,
        handleSettingsSave,
    } = useModeration(community_id);

    const getInitials = (name) => {
        if (!name) return "";
        return name
            .split(" ")
            .map((word) => word[0])
            .join("");
    };

    useEffect(() => {
        const fetchCommunityDetails = async () => {
            try {
                const response = await AxiosInstance.get(
                    `/api/community/${community_id}`,
                    {},
                    { withCredentials: true }
                );
                setCommunityDetails(response.data);
            } catch (error) {
                setError(`Error fetching community details: ${error.message}`);
            }
        };

        const fetchTopStats = async () => {
            try {
                const response = await AxiosInstance.get(
                    `/api/community/${community_id}/stats`,
                    { withCredentials: true }
                );
                setTopStats(response.data);
                setMostLikedPosts(response.data.most_liked_posts || []);
                setMostDislikedPosts(response.data.most_disliked_posts || []);
                setMostCommentedPosts(response.data.most_commented_posts || []);
            } catch (error) {
                setError(`Error fetching stats: ${error.message}`);
            }
        };

        fetchCommunityDetails();
        fetchTopStats();
    }, [community_id]);

    return (
        <div className="min-h-screen bg-base-100">
            <Helmet>
                <title>{communityDetails.name ? communityDetails.name: `Community`} - Settings</title>
            </Helmet>
            {/* Header */}
            <header className="bg-base-300 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center">
                        <div
                            className="ml-3 w-24 h-24 relative border-4 border-white rounded-full overflow-hidden mx-3"
                        >
                            <div className="avatar placeholder">
                                <div className="bg-neutral text-neutral-content h-24 rounded-full">
                                    {communityDetails.imgURL ? (
                                        <img
                                            src={communityDetails.imgURL}
                                            alt={`avatar-${communityDetails.name}`}
                                        />
                                    ) : (
                                        <h2 className="text-lg font-bold">
                                            {getInitials(communityDetails.name)}
                                        </h2>
                                    )}
                                </div>
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold">{communityDetails.name}</h1>
                    </div>
                </div>
            </header>

            {/* Tab Selector */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="tabs border-b border-gray-300">
                    <button
                        className={`tab px-6 py-2 font-medium ${activeTab === "moderation" ? "tab-active text-primary border-b-2 border-primary" : "text-gray-500 hover:text-gray-400"
                            }`}
                        onClick={() => setActiveTab("moderation")}
                    >
                        Moderation Queue
                    </button>
                    <button
                        className={`tab px-6 py-2 font-medium ${activeTab === "stats" ? "tab-active text-primary border-b-2 border-primary" : "text-gray-500 hover:text-gray-400"
                            }`}
                        onClick={() => setActiveTab("stats")}
                    >
                        Top 10 Stats
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl rounded rounded-lg bg-base-200 my-5 mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === "moderation" && (
                    <>
                        <ModStats stats={stats} />
                        <ModActions onOpenSettings={() => setIsSettingsOpen(true)} />
                        <div className="border rounded-lg shadow-sm p-4 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">Moderation Queue</h2>
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="select select-bordered rounded-md py-1.5 text-sm"
                                >
                                    <option value="all">All Reports</option>
                                    <option value="posts">Posts</option>
                                    <option value="comments">Comments</option>
                                    <option value="users">Users</option>
                                </select>
                            </div>
                            <ModQueue
                                reports={reports}
                                onApprove={handleApprove}
                                onReject={handleReject}
                            />
                        </div>
                        <ModSettingsModal
                            isOpen={isSettingsOpen}
                            onClose={() => setIsSettingsOpen(false)}
                            settings={settings}
                            onSave={handleSettingsSave}
                        />
                    </>
                )}

                {activeTab === "stats" && topStats && <Top10Stats mostCommentedPosts={mostCommentedPosts} mostLikedPosts={mostLikedPosts} mostDislikedPosts={mostDislikedPosts} communityId={community_id} />}
            </main>
        </div>
    );
}

export default ModDashboard;
