import React, { useState, useEffect } from "react";
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

const API_URL = process.env.REACT_APP_API_BASE_URI;
const CreatePost = ({ userName, community }) => {
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [title, setTitle] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [editorContent, setEditorContent] = useState("");
    const [isFormVisible, setIsFormVisible] = useState(false);



    async function imageUploadHandler(image) {
        const formData = new FormData();
        formData.append('image', image); // Ensure that the key matches the serializer field

        try {
            const response = await axios.post(`${API_URL}/api/community/upload/image`, formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("access_token")}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (!response.data || !response.data.url) {
                setError('Invalid response from server');
                throw new Error('Invalid response from server');
            }

            return response.data.url;
        } catch (error) {
            setError('Error uploading image');
            console.error('Error uploading image:', error);
            return null;
        }
    }

    const handleEditorChange = (markdown) => {
        setEditorContent(markdown);
    };

    useEffect(() => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        setIsDarkMode(currentTheme === 'dark');
    }, []);


    const toggleFormVisibility = () => {
        setIsFormVisible(!isFormVisible);
    };

    const handlePostClick = async () => {
        const formData = new FormData();
        formData.append("title", DOMPurify.sanitize(title));
        formData.append("content", DOMPurify.sanitize(editorContent));
        formData.append("posted_in", community);

        try {
            const response = await axios.post(`${API_URL}/api/community/post`, formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("access_token")}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200 || response.status === 201) {
                setTitle('');
                setEditorContent('');
                console.log('Post submitted successfully');
                setSuccess('Post submitted successfully');
                toggleFormVisibility();

            } else {
                console.error('Error submitting post: ', response.statusText);
                setError('Error submitting post' + response.statusText);
            }
        } catch (error) {
            console.error('Error submitting post:', error);
            setError('Error submitting post' + error);
        }
    };

    return (
        <>
            {error && <ErrorAlert text={error} />}
            {success && <SuccessAlert text={success} />}

            <label className="input input-bordered flex items-center gap-2">
                <button type="button" className="grow text-start" onClick={toggleFormVisibility}>
                    {`What's new, ${userName}`}
                </button>
            </label>
            {isFormVisible && (
                <form className="mx-auto">
                    <div className="mb-5">
                        <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Title</label>
                        <input type="text" id="title" className="input input-bordered w-full" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <span className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Body</span>
                    <div className="mb-5 border border-solid rounded">
                    <MDXEditor
                                    className={`editor z-40 ${isDarkMode ? "dark-theme dark-editor" : "light-theme light-editor"}`}
                                    markdown={editorContent}
                                    readOnly={false}
                                    onChange={handleEditorChange}
                                    plugins={[
                                        headingsPlugin(),
                                        listsPlugin(),
                                        tablePlugin(),
                                        imagePlugin({ imageUploadHandler }),
                                        toolbarPlugin({
                                            toolbarContents: () => (
                                                <>
                                                    <BoldItalicUnderlineToggles />
                                                    <ListsToggle />
                                                    <InsertTable />
                                                    <InsertImage />
                                                </>
                                            ),
                                        }),
                                    ]}
                                />
                    </div>
                    <input type="button" className="btn btn-outline" value="Post" onClick={handlePostClick} />
                </form>
            )}

        </>
    );
};

CreatePost.propTypes = {
    userName: PropTypes.string.isRequired,
};

export default CreatePost;
