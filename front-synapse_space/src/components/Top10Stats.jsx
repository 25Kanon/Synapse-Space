import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp, faThumbsDown, faComment } from "@fortawesome/free-solid-svg-icons";

const Top10Stats = ({ mostLikedPosts, mostDislikedPosts, mostCommentedPosts, communityId }) => {
    const [activeStatTab, setActiveStatTab] = useState("mostLiked");

    return (
        <div>
            {/* Tab Selector */}
            <div className="tabs border-b border-gray-300">
                <button
                    className={`tab px-6 py-2 font-medium whitespace-nowrap ${activeStatTab === "mostLiked" ? "tab-active text-primary border-b-2 border-primary" : "text-gray-500 hover:text-gray-800"
                        }`}
                    onClick={() => setActiveStatTab("mostLiked")}
                >
                    Most Liked
                </button>
                <button
                    className={`tab px-6 py-2 font-medium whitespace-nowrap ${activeStatTab === "mostDisliked" ? "tab-active text-primary border-b-2 border-primary" : "text-gray-500 hover:text-gray-800"
                        }`}
                    onClick={() => setActiveStatTab("mostDisliked")}
                >
                    Most Disliked
                </button>
                <button
                    className={`tab px-6 py-2 font-medium whitespace-nowrap ${activeStatTab === "mostCommented" ? "tab-active text-primary border-b-2 border-primary" : "text-gray-500 hover:text-gray-800"
                        }`}
                    onClick={() => setActiveStatTab("mostCommented")}
                >
                    Most Commented
                </button>
            </div>

            {/* Tab Content */}
            <div className="p-4">
                {activeStatTab === "mostLiked" && (
                    <div className="space-y-4">
                        {mostLikedPosts.map((post, index) => (
                            <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg shadow-sm bg-base-100">
                                <div className="flex items-center space-x-3">
                                    <span className="text-lg font-bold text-primary">{index + 1}</span>
                                    <Link
                                        to={`/community/${communityId}/post/${post.id}`}
                                        className="text-blue-500 hover:underline truncate max-w-xs"
                                        title={post.title}
                                    >
                                        {post.title}
                                    </Link>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <FontAwesomeIcon icon={faThumbsUp} className="text-green-500" />
                                    <span className="text-gray-400">{post.like_count} Likes</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {activeStatTab === "mostDisliked" && (
                    <div className="space-y-4">
                        {mostDislikedPosts.map((post, index) => (
                            <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg shadow-sm bg-base-100">
                                <div className="flex items-center space-x-3">
                                    <span className="text-lg font-bold text-primary">{index + 1}</span>
                                    <Link
                                        to={`/community/${communityId}/post/${post.id}`}
                                        className="text-blue-500 hover:underline truncate max-w-xs"
                                        title={post.title}
                                    >
                                        {post.title}
                                    </Link>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <FontAwesomeIcon icon={faThumbsDown} className="text-red-500" />
                                    <span className="text-gray-400">{post.dislike_count} Dislikes</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {activeStatTab === "mostCommented" && (
                    <div className="space-y-4">
                        {mostCommentedPosts.map((post, index) => (
                            <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg shadow-sm bg-base-100">
                                <div className="flex items-center space-x-3">
                                    <span className="text-lg font-bold text-primary">{index + 1}</span>
                                    <Link
                                        to={`/community/${communityId}/post/${post.id}`}
                                        className="text-blue-500 hover:underline truncate max-w-xs"
                                        title={post.title}
                                    >
                                        {post.title}
                                    </Link>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <FontAwesomeIcon icon={faComment} className="text-purple-500" />
                                    <span className="text-gray-400">{post.comment_count} Comments</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Top10Stats;
