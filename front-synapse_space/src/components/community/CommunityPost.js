import React, { useState, useEffect, useRef } from "react";
import PropTypes from 'prop-types';
import '@mdxeditor/editor/style.css';
import {
    listsPlugin,
    headingsPlugin,
    tablePlugin,
    MDXEditor,
    imagePlugin,
    diffSourcePlugin
} from "@mdxeditor/editor";

const CommunityPost = ({ userName, userAvatar, community, postTitle, postContent, postId }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [expandedPosts, setExpandedPosts] = useState({});
    const [hasOverflow, setHasOverflow] = useState({});

    const cardBodyRefs = useRef({}); // Object to store refs for each post

    useEffect(() => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        setIsDarkMode(currentTheme === 'dark');
    }, []);

    useEffect(() => {
        if (cardBodyRefs.current[postId]) {
            const cardBody = cardBodyRefs.current[postId];
            const isOverflowing = cardBody.scrollHeight > cardBody.clientHeight;

            if (isOverflowing) {
                setHasOverflow(prev => ({ ...prev, [postId]: true }));
            }
        }
    }, [postContent, postId, community]); // Runs whenever postContent or postId changes

    const toggleExpand = () => {
        setExpandedPosts(prev => ({
            ...prev,
            [postId]: !prev[postId],
        }));
    };

    const isExpanded = expandedPosts[postId];
    const hasContentOverflow = hasOverflow[postId];

    return (
        <div key={postId} className="w-full my-5 border border-solid rounded shadow-xl card card-compact">
            <div
                ref={el => (cardBodyRefs.current[postId] = el)} // Store the ref for each post using postId as the key
                className={`card-body ${isExpanded ? 'max-h-none' : 'max-h-48 overflow-hidden'}`}
            >
                <div className="flex items-center h-5">
                    <div className="mx-2 avatar">
                        <div className="rounded-full h-7">
                            <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" alt="User avatar" />
                        </div>
                    </div>
                    <p className="flex items-center text-sm font-semibold">
                        {userName}
                    </p>
                </div>
                <h2 className="card-title">{postTitle}</h2>

                <MDXEditor
                    className={`editor z-40 ${isDarkMode ? "dark-theme dark-editor" : "light-theme light-editor"}`}
                    markdown={postContent}
                    readOnly={true}
                    plugins={[
                        headingsPlugin(),
                        listsPlugin(),
                        tablePlugin(),
                        imagePlugin(),
                        diffSourcePlugin({
                            markdownSourceValue: postContent,
                        }),
                    ]}
                />
            </div>
            {hasContentOverflow && (
                <button
                    onClick={toggleExpand}
                    className="btn btn-link"
                >
                    {isExpanded ? 'See less' : 'See more'}
                </button>
            )}
        </div>
    );
};

CommunityPost.propTypes = {
    userName: PropTypes.string.isRequired,
    postTitle: PropTypes.string.isRequired,
    postContent: PropTypes.string.isRequired,
    postId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default CommunityPost;
