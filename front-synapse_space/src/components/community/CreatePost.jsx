import React, { useState, useEffect, useRef } from "react";
import DOMPurify from "dompurify";
import axios from "axios";
import Swal from "sweetalert2";
import ErrorAlert from "../ErrorAlert";
import SuccessAlert from "../SuccessAlert";
import PropTypes from 'prop-types';
import '@mdxeditor/editor/style.css';
import RichTextEditor from "../RichTextEditor";
import AxiosInstance from '../../utils/AxiosInstance';
import Loading from "../Loading";

const CreatePost = ({ userName, community, onPostCreated, rules }) => {
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [title, setTitle] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [editorContent, setEditorContent] = useState("");
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const dialogRef = useRef(null);

    const editorJsToPlainText = (editorContent) => {
        if (!editorContent || !Array.isArray(editorContent.blocks)) {
            console.log('Invalid editor content');
            return '';
        }

        console.log('Processing blocks:', editorContent.blocks);

        return editorContent.blocks
            .map(block => {
                if (!block || !block.data) return '';

                console.log('Block Data:', block.data);
                switch (block.type) {
                    case 'paragraph':
                        return block.data.text || '';
                    case 'header':
                        return block.data.text || '';
                    case 'list':
                        return block.data.items.join('\n');
                    case 'quote':
                        return block.data.text || '';
                    case 'image':
                        return '';
                    default:
                        return '';
                }
            })
            .join('\n')
            .trim();
    };

    useEffect(() => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        setIsDarkMode(currentTheme === 'dark');
    }, []);

    const toggleFormVisibility = () => {
        setIsFormVisible(!isFormVisible);
    };

    const profanityCheck = async (title, content) => {
        try {
            const payload = {
                title: DOMPurify.sanitize(title),
                content: DOMPurify.sanitize(content),
            };

            const response = await AxiosInstance.post('/api/check_profanity/', payload, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            return response.data.allow;
        } catch (error) {
            return false;
        }
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
            setLoading(true);
            const updatedContent = await moveImagesToPermanentStorage(editorContent);

            // const plainText = editorJsToPlainText(updatedContent);
            // const hasProfanity = await profanityCheck(title, plainText);
            //
            // if (!hasProfanity) {
            //     Swal.fire({
            //         icon: 'error',
            //         title: 'Oops...',
            //         text: 'Post contains profanity!',
            //     });
            //     setLoading(false);
            //     return;
            // }

            const formData = new FormData();
            formData.append("title", DOMPurify.sanitize(title));
            formData.append("content", JSON.stringify(updatedContent));
            formData.append("posted_in", community);

            const response = await AxiosInstance.post(`/api/community/${community}/post`, formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.status === 200 || response.status === 201) {
                setTitle('');
                setEditorContent('');
                setSuccess('Post submitted successfully');
                toggleFormVisibility();
                onPostCreated();
            } else {
                setError('Error submitting post: ' + response.statusText);
            }
        } catch (error) {
            setError('Error submitting post: ' + error.message);
            console.error('Post submission error:', error);
        } finally {
            setLoading(false);
            document.getElementById('loading-modal').close();
        }
    };

    const moveImagesToPermanentStorage = async (content) => {
        const updatedBlocks = await Promise.all(content.blocks.map(async (block) => {
            if (block.type === 'image') {
                const tempUrl = block.data.file.url;
                const response = await AxiosInstance.post(`/api/move-image/`, { tempUrl }, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });
                if (response.status === 200) {
                    block.data.file.url = response.data.newUrl;
                }
            }
            return block;
        }));
        return { ...content, blocks: updatedBlocks };
    };

    useEffect(() => {
        if (loading) {
            document.getElementById('loading-modal').showModal();
        }
    }, [loading]);

    return (
        <>
            {error && <ErrorAlert text={error}/>}
            {success && <SuccessAlert text={success}/>}
            <dialog
                ref={dialogRef}
                id="loading-modal"
                className="modal modal-bottom sm:modal-middle"
                onClose={(e) => e.preventDefault()}
                onCancel={(e) => e.preventDefault()}
            >
                <form method="dialog" className="modal-box" onSubmit={(e) => e.preventDefault()}>
                    <Loading loadingText="Please wait..."/>
                </form>
            </dialog>

            <label className="flex items-center gap-2 input input-bordered">
                <button type="button" className="grow text-start" onClick={toggleFormVisibility}>
                    {`What's new, ${userName}`}
                </button>
            </label>
            {isFormVisible && (
                <form className="p-2 m-5 rounded bg-base-100">
                    <div className="mb-5">
                        <label htmlFor="title"
                               className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Title</label>
                        <input required={true} type="text" id="title" className="w-full input input-bordered"
                               value={title} onChange={(e) => setTitle(e.target.value)}/>
                    </div>
                    <span className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Body</span>
                    <div className="mb-5">
                        <RichTextEditor setEditorContent={setEditorContent} isEditing={false}/>
                    </div>
                    <button type="button" className="btn btn-primary" onClick={handlePostClick}>Post</button>
                </form>
            )}
        </>
    );
};

CreatePost.propTypes = {
    userName: PropTypes.string.isRequired,
    community: PropTypes.number.isRequired,
    onPostCreated: PropTypes.func.isRequired
};

export default CreatePost;