import React, {useEffect, useState} from "react";
import PropTypes from 'prop-types';
import '@mdxeditor/editor/style.css';
import { Link } from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faThumbsUp} from "@fortawesome/free-regular-svg-icons/faThumbsUp";
import { faThumbsUp as ThumbsUpIcon } from "@fortawesome/free-solid-svg-icons/faThumbsUp";
import Checkbox from '@mui/material/Checkbox';
import {faComment} from "@fortawesome/free-solid-svg-icons/faComment";
import {FormControlLabel} from "@mui/material";
import AxiosInstance from '../../utils/AxiosInstance';
import CommentSection from './CommentSection';
import StyledOutput from "./StyledOutput";


const CommunityPost = ({ userName, userAvatar, community, postTitle, postContent, postId, userID, showComments }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likes, setLikes] = useState(0);

    useEffect(()=>{
        const fetchLikeStatus = async () => {
            try {

                const likes= await AxiosInstance.get(`/api/community/${community}/post/${postId}/likes`, {}, { withCredentials: true,});

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

    }, [community, postId, isLiked, userID]);


    const handleLikeChange = () => {
        const url = `/api/community/${community}/post/${postId}/${isLiked ? 'unlike' : 'like'}`;
         AxiosInstance.post(url, { postId }, { withCredentials: true})

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

                    <article className="prose text-overflow: ellipsis">
                        <StyledOutput data={JSON.parse(postContent)} />
                    </article>

                </div>

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
