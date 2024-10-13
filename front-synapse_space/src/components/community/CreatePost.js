import React, { useState, useEffect } from "react";
import DOMPurify from "dompurify";
import axios from "axios";
import ErrorAlert from "../ErrorAlert";
import SuccessAlert from "../SuccessAlert";
import PropTypes from 'prop-types';
import '@mdxeditor/editor/style.css';
import RichTextEditor from "../RichTextEditor";

const API_URL = process.env.REACT_APP_API_BASE_URI;
const CreatePost = ({ userName, community }) => {
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [title, setTitle] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [editorContent, setEditorContent] = useState("");
    const [isFormVisible, setIsFormVisible] = useState(false);

    useEffect(() => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        setIsDarkMode(currentTheme === 'dark');
    }, []);

    const toggleFormVisibility = () => {
        setIsFormVisible(!isFormVisible);
    };

    const handlePostClick = async () => {
        setSuccess(null);
        setError(null);

        if (!title.trim()) {
            setError("Title is required");
            return;
        }
        if (!editorContent.blocks || editorContent.blocks.length === 0) {
            setError("Content is required");
            return;
        }

        try {
            // Move images to permanent storage and update URLs
            const updatedContent = await moveImagesToPermanentStorage(editorContent);

            const formData = new FormData();
            formData.append("title", DOMPurify.sanitize(title));
            formData.append("content", JSON.stringify(updatedContent));
            formData.append("posted_in", community);

            const response = await axios.post(`${API_URL}/api/community/${community}/post`, formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("access_token")}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200 || response.status === 201) {
                setTitle('');
                setEditorContent('');
                setSuccess('Post submitted successfully');
                toggleFormVisibility();
            } else {
                setError('Error submitting post' + response.statusText);
            }
        } catch (error) {
            setError('Error submitting post' + error);
        }
    };

    const moveImagesToPermanentStorage = async (content) => {
        const updatedBlocks = await Promise.all(content.blocks.map(async (block) => {
            if (block.type === 'image') {
                const tempUrl = block.data.file.url;
                const response = await axios.post(`${API_URL}/api/move-image/`, { tempUrl }, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("access_token")}`,
                    },
                });
                if (response.status === 200) {
                    block.data.file.url = response.data.newUrl;
                }
            }
            return block;
        }));
        return { ...content, blocks: updatedBlocks };
    };

    return (
        <>
            {error && <ErrorAlert text={error}/> }
            {success && <SuccessAlert text={success} />}

            <label className="flex items-center gap-2 input input-bordered">
                <button type="button" className="grow text-start" onClick={toggleFormVisibility}>
                    {`What's new, ${userName}`}
                </button>
            </label>
            {isFormVisible && (
                <form className="p-2 m-5 rounded bg-base-100">
                    <div className="mb-5">
                        <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Title</label>
                        <input required={true} type="text" id="title" className="w-full input input-bordered" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <span className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Body</span>
                    <div className="mb-5">
                        <RichTextEditor setEditorContent={setEditorContent} />
                    </div>
                    <button type="button" className="btn btn-primary" onClick={handlePostClick}>Post</button>
                </form>
            )}
        </>
    );
};

CreatePost.propTypes = {
    userName: PropTypes.string.isRequired,
    community: PropTypes.string.isRequired
};

export default CreatePost;