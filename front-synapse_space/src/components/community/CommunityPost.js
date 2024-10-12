import React, {useEffect, useState} from "react";
import PropTypes from 'prop-types';
import '@mdxeditor/editor/style.css';
import { Link } from "react-router-dom";
import DOMPurify from "dompurify";
import { marked } from "marked";
import MarkdownIt from 'markdown-it';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronDown} from "@fortawesome/free-solid-svg-icons/faChevronDown";
import {faThumbsUp} from "@fortawesome/free-regular-svg-icons/faThumbsUp";
import { faThumbsUp as ThumbsUpIcon } from "@fortawesome/free-solid-svg-icons/faThumbsUp";
import {faChevronUp} from "@fortawesome/free-solid-svg-icons/faChevronUp";
import Checkbox from '@mui/material/Checkbox';
import {faComment} from "@fortawesome/free-solid-svg-icons/faComment";
import {FormControlLabel} from "@mui/material";
import axios from "axios";
import CommentSection from './CommentSection';

const CommunityPost = ({ userName, userAvatar, community, postTitle, postContent, postId, userID, showComments }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likes, setLikes] = useState(0);
    const API_URL = process.env.REACT_APP_API_BASE_URI;

    const previewLength = 300; // Set the character limit for preview content

    const md = new MarkdownIt();

    marked.setOptions({
        breaks: true, // Allow line breaks
        gfm: true, // Use GitHub Flavored Markdown
    });

    // Truncate Markdown content while preserving tag integrity
    const truncateMarkdown = (markdown, maxLength) => {
        const tokens = md.parse(markdown, {});
        let truncatedText = '';
        let currentLength = 0;

        for (let token of tokens) {
            if (currentLength >= maxLength) break;

            if (token.type === 'inline' && token.children) {
                for (let child of token.children) {
                    if (currentLength + child.content.length > maxLength) {
                        truncatedText += child.content.slice(0, maxLength - currentLength);
                        currentLength = maxLength;
                        break;
                    } else {
                        truncatedText += child.content;
                        currentLength += child.content.length;
                    }
                }
            } else {
                truncatedText += token.content;
                currentLength += token.content.length;
            }
        }

        return truncatedText;
    };

    // Get truncated or full Markdown content
    const contentToRender = isExpanded ? postContent : truncateMarkdown(postContent, previewLength);
    const shouldTruncate = postContent.length > previewLength;

    // Convert Markdown to sanitized HTML
    const getMarkdownText = (text) => {
        const rawMarkup = marked(text);
        return DOMPurify.sanitize(rawMarkup); // Sanitize the HTML
    };

    useEffect(()=>{
        const fetchLikeStatus = async () => {
            try {
                const likes = await axios.get(`${API_URL}/api/community/${community}/post/${postId}/likes`, {

                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    }
                });
                if (likes.status === 200) {
                    setLikes(likes.data);
                    if (likes.data.some((like) => like.user === userID)) {
                        setIsLiked(true);
                    }
                } else {
                    console.error('Failed to fetch likes for the post');
                }
            } catch (error) {
            }
        };
        fetchLikeStatus();

    }, [community, postId, isLiked]);


    const handleLikeChange = () => {
        const url = `${API_URL}/api/community/${community}/post/${postId}/${isLiked ? 'unlike' : 'like'}`;
        axios.post(url, { postId }, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            }
        })
            .then(response => {
                if (response.status === 200 || response.status === 201) {
                    setIsLiked(!isLiked);
                } else {
                    console.error('Failed to change like status');
                }
            })
            .catch(error => {
                console.error('Error occurred while changing like status:', error);
            });
    };

    const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

    return (
        <>
            <div key={postId} className="w-full my-5 border border-solid shadow-xl card card-compact">
                <div className="card-body">
                    <div className="flex items-center h-5">
                        <div className="mx-2 avatar">
                            <div className="rounded-full h-7">
                                <img
                                    src={userAvatar || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
                                    alt="User avatar"
                                />
                            </div>
                        </div>
                        <p className="flex items-center text-sm font-semibold">
                            {userName}
                        </p>
                    </div>
                    <Link to={`/community/${community}/post/${postId}`}>
                        <h2 className="card-title">{postTitle}</h2>
                    </Link>

                    <article
                        className="prose prose-lg"
                        dangerouslySetInnerHTML={{
                            __html: getMarkdownText(contentToRender),
                        }}
                    />
                </div>
                {shouldTruncate && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="btn btn-link w-fit text-primary-600 hover:text-blue-800 mt-4 flex items-center"
                    >
                        {isExpanded ? 'See less' : 'See more'}
                        <span className="ms-3">
            <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown}/>
        </span>
                    </button>
                )}
                <div className="flex flex-row m-4 -gap-4">

                    <FormControlLabel
                        name="likeBtn"
                        value={likes.length}
                        control={<Checkbox onChange={handleLikeChange}
                                           checked={isLiked} {...label}
                                           icon={<FontAwesomeIcon
                                               className="text-xl text-current text-secondary dark:text-neutral-300"
                                               icon={faThumbsUp}/>}
                                           checkedIcon={<FontAwesomeIcon className="text-xl" icon={ThumbsUpIcon}/>}/>}
                        label={likes.length}
                        labelPlacement="end"
                    />
                    <button className="btn btn-circle">
                        <FontAwesomeIcon icon={faComment} className="text-current"/>
                    </button>
                </div>
                {/*comments*/}
                {showComments && (
                    <div className="m-5">
                        <CommentSection postID={postId}/>
                    </div>
                )}
            </div>
        </>
    )
        ;
};

CommunityPost.propTypes = {
    userName: PropTypes.string.isRequired,
    userAvatar: PropTypes.string,
    community: PropTypes.string.isRequired,
    postTitle: PropTypes.string.isRequired,
    postContent: PropTypes.string.isRequired,
    postId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    showComments: PropTypes.bool
};

export default CommunityPost;
