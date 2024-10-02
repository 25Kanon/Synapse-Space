import React, { useState, useEffect, useContext } from "react";
import DOMPurify from "dompurify";
import axios from "axios";
import AuthContext from "../../context/AuthContext";
import ErrorAlert from "../ErrorAlert";
import SuccessAlert from "../SuccessAlert";

import PropTypes from 'prop-types';
import '@mdxeditor/editor/style.css';
import {
    BoldItalicUnderlineToggles,
    listsPlugin,
    headingsPlugin,
    ListsToggle,
    tablePlugin,
    MDXEditor,
    toolbarPlugin,
    InsertTable,
    imagePlugin,
    InsertImage,
} from "@mdxeditor/editor";
import { useParams } from 'react-router-dom';
import { marked } from 'marked';

const API_URL = process.env.REACT_APP_API_BASE_URI;

const CommunityPost = ({ userName, community }) => {
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [title, setTitle] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [editorContent, setEditorContent] = useState("");
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [posts, setPosts] = useState([]);


    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/community/${community}/posts/`);
                setPosts(response.data);
                console.log(response);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching posts:', err);
            }
        };

        if (community) {
            fetchPosts();
            console.log("fetching")
        } else {
            console.error('Community is undefined');
        }
    }, [posts,community]);

    return (
        <>
            {error && <ErrorAlert message={error} />}
            {success && <SuccessAlert message={success} />}

            {posts.map((post) => (
                <div key={post.id} className="w-full my-5 border border-solid rounded shadow-xl card card-compact">
                    <div className="card-body">
                        <div className="flex items-center h-5">
                            <div className="mx-2 avatar">
                                <div className="rounded-full h-7">
                                    <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" alt="User avatar" />
                                </div>
                            </div>

                            <p className="flex items-center text-sm font-semibold">
                                {post.created_by_username} 
                            </p>
                        </div>
                        <h2 className="card-title">{post.title}</h2>

                        <div
                            className="post-content"
                            dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(marked(post.content)),
                            }}
                        />
                    
                        
                    </div>
                </div>
            ))}

            <MDXEditor
                className={`editor z-40 ${isDarkMode ? "dark-theme dark-editor" : "light-theme light-editor"}`}
                markdown={editorContent}
                readOnly={false}
                onChange={(value) => setEditorContent(value)}
                plugins={[
                    headingsPlugin(),
                    listsPlugin(),
                    tablePlugin(),
                    imagePlugin(),
                ]}
            />
        </>
    );
};

CommunityPost.propTypes = {
    userName: PropTypes.string.isRequired,
};

export default CommunityPost;
