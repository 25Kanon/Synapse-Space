import React, {useContext, useEffect, useState} from "react";
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
import AuthContext from "../../context/AuthContext";
import ReportForm from "../../components/ReportForm"

const CommunityPost = ({ userName, userAvatar, community, postTitle, postContent, postId, userID, showComments, authorId}) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likes, setLikes] = useState(0);
    const { user} = useContext(AuthContext);
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

    const handleReport = () => {
        const url = `/api/create-report`;
        AxiosInstance.post(url, { postId }, { withCredentials: true})
            .then(response => {
                if (response.status === 200 || response.status === 201) {
                    console.log('Post reported successfully');
                } else {
                    console.error('Failed to report the post');
                }
            })
            .catch(error => {
                console.error('Error occurred while reporting the post:', error);
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
                        <div className="mx-2">
                            <div className="dropdown dropdown-end">
                                <label tabIndex={0} className="btn btn-ghost btn-circle">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
                                         viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                                    </svg>
                                </label>
                                <ul tabIndex={0}
                                    className="p-2 shadow menu dropdown-content bg-secondary rounded-box w-52">
                                    {authorId ? user.id &&
                                        <div>
                                            <li><Link to={`/community/${community}/post/${postId}/edit`}>Edit</Link>
                                            </li>
                                            <li><Link to={`/community/${community}/post/${postId}/delete`}>Delete</Link>
                                            </li>
                                        </div> :
                                        <li><a>Report</a></li>
                                    }
                                    <li>
                                        <button
                                                onClick={() => document.getElementById(`modal${postId}`).showModal()}>open
                                            modal
                                        </button>
                                    </li>
                                    <dialog id={`modal${postId}`} className="modal">
                                        <ReportForm type={"post"} object={postId} community={community}/>
                                    </dialog>


                                </ul>
                            </div>
                        </div>
                    </div>
                    <Link to={`/community/${community}/post/${postId}`}>
                        <h2 className="card-title">{postTitle}</h2>
                    </Link>

                    <article className="prose text-overflow: ellipsis">
                        <StyledOutput data={JSON.parse(postContent)}/>
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
    community: PropTypes.number.isRequired,
    postTitle: PropTypes.string.isRequired,
    postContent: PropTypes.string.isRequired,
    postId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    showComments: PropTypes.bool,
    authorId: PropTypes.number,
};

export default CommunityPost;
