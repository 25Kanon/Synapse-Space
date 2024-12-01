import React, { useState } from "react";
import CreatePost from "./CreatePost";
import { CreateActivity } from "./CreateActivity";

const CreateContent = ({ userName, community, rules, onPostCreated, onActivityCreated }) => {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [activeTab, setActiveTab] = useState("post");

    const toggleFormVisibility = () => {
        setIsFormVisible(!isFormVisible);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <>
            <label className="flex items-center gap-2 input input-bordered">
                <button
                    type="button"
                    className="grow text-start"
                    onClick={toggleFormVisibility}
                >
                    {`What's new, ${userName}`}
                </button>
            </label>
            {isFormVisible && (
                <div className="tabs tabs-boxed p-3">
                    <div className="flex gap-4">
                        <button
                            className={`tab ${activeTab === "post" ? "tab-active" : ""}`}
                            onClick={() => handleTabChange("post")}
                        >
                            Create Post
                        </button>
                        <button
                            className={`tab ${activeTab === "activity" ? "tab-active" : ""}`}
                            onClick={() => handleTabChange("activity")}
                        >
                            Start a Community Activity
                        </button>
                    </div>
                    <div className="mt-4">
                        {activeTab === "post" && (
                            <CreatePost
                                userName={userName}
                                community={community}
                                rules={rules}
                                onPostCreated={() => {
                                    onPostCreated(); // Trigger refresh in parent
                                    setIsFormVisible(false);
                                }}
                            />
                        )}
                        {activeTab === "activity" && (
                            <CreateActivity
                                community={community}
                                onActivityCreated={() => {
                                    onActivityCreated(); // Trigger refresh in parent
                                    setIsFormVisible(false);
                                }}
                            />
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default CreateContent;
