import React, { useState, useEffect } from "react";
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

const CommunityPost = ({ userName, userAvatar, community, postTitle, postContent, postId, hasOverflow, cardBodyRef }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        setIsDarkMode(currentTheme === 'dark');
    }, []);

    const toggleExpand = () => {
        setExpanded(prev => !prev);
    };

    return (
        <div key={postId} className="w-full my-5 border border-solid rounded shadow-xl card card-compact">
            <div
                ref={cardBodyRef}
                className={`card-body ${expanded ? 'max-h-none' : 'max-h-48 overflow-hidden'}`}
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
            {hasOverflow && (
                <button
                    onClick={toggleExpand}
                    className="btn btn-link"
                >
                    {expanded ? 'See less' : 'See more'}
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
    hasOverflow: PropTypes.bool,
    cardBodyRef: PropTypes.func.isRequired,
};

export default CommunityPost;
