import React, { useState } from 'react';
import CreatePost from './CreatePost';
import { CreateActivity } from './CreateActivity';

const CreateContent = ({ userName, community, rules, onPostCreated }) => {
    const [isFormVisible, setIsFormVisible] = useState(false);

    const toggleFormVisibility = () => {
        setIsFormVisible(!isFormVisible);
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
                <div role="tablist" className="tabs tabs-bordered tabs-lg p-3">
                    <input
                        type="radio"
                        name="my_tabs_1"
                        role="tab"
                        className="tab ms-3"
                        aria-label="Create Post"
                        defaultChecked
                    />
                    <div role="tabpanel" className="tab-content">
                        <CreatePost
                            userName={userName}
                            community={community}
                            rules={rules}
                            onPostCreated={() => {
                                onPostCreated(); // Trigger refresh in parent
                                setIsFormVisible(false);
                            }}
                        />
                    </div>

                    <input
                        type="radio"
                        name="my_tabs_1"
                        role="tab"
                        className="tab"
                        aria-label="Start a Community Activity"
                    />
                    <div role="tabpanel" className="tab-content">
                        <CreateActivity
                            onActivityCreated={() => {
                                onPostCreated(); // Trigger refresh in parent
                                setIsFormVisible(false);
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default CreateContent;

