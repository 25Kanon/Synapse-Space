import React, {useContext, useEffect, useState} from "react";
import PropTypes from 'prop-types';
import '@mdxeditor/editor/style.css';
import {Link} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faThumbsUp} from "@fortawesome/free-regular-svg-icons/faThumbsUp";
import {faThumbsUp as ThumbsUpIcon} from "@fortawesome/free-solid-svg-icons/faThumbsUp";
import Checkbox from '@mui/material/Checkbox';
import {faComment} from "@fortawesome/free-solid-svg-icons/faComment";
import {FormControlLabel} from "@mui/material";
import AxiosInstance from '../../utils/AxiosInstance';
import CommentSection from './CommentSection';
import StyledOutput from "./StyledOutput";
import AuthContext from "../../context/AuthContext";
import ReportForm from "../../components/ReportForm"

const CommunityPost = ({
                           userName,
                           userAvatar,
                           community,
                           postTitle,
                           postContent,
                           postId,
                           userID,
                           showComments,
                           authorId,
                           isPinned,
                       }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likes, setLikes] = useState(0);
    const {user} = useContext(AuthContext);
    const [role, setRole] = useState('');
    const communityID = community;
    const getInitials = (name) => {
        return name.split(' ').map(word => word[0]).join('');
    };

    const handleLikeChange = () => {
        const url = `/api/community/${community}/post/${postId}/${isLiked ? 'unlike' : 'like'}`;
        AxiosInstance.post(url, {postId}, {withCredentials: true})

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


    const label = {inputProps: {'aria-label': 'Checkbox demo'}};

    const fetchMembership = async () =>  {
        try{
            const response = await AxiosInstance.get(`api/community/${community}/membership/role/`,{},{withCredentials: true});
            setRole(response.data.role);
            console.log(response.data.role);
        }catch (error){
            console.log(error);
        }
    }

    const pinpost = async () => {
        try{
            const response = await AxiosInstance.post(`api/community/${community}/post/${postId}/pin/`,{},{withCredentials: true});
            console.log(response);
        }catch (error){
            console.log(error);
        }
    }

    const unpinPost = async () => {
        try {
            const response = await AxiosInstance.post(`api/community/${community}/post/${postId}/unpin/`, {}, {withCredentials: true});
            console.log(response);
            setIsPinned(false);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        const fetchLikeStatus = async () => {
            try {

                const likes = await AxiosInstance.get(`/api/community/${community}/post/${postId}/likes`, {}, {withCredentials: true,});

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
        fetchMembership();

    }, [community, postId, isLiked, userID]);

    return (
        <>
            <div key={postId} className={`w-full my-5 border border-solid shadow-xl card card-compact ${isPinned ? 'border-amber-400' : ''}`}>

                <div className="card-body">
                    <div className="flex items-center h-5">
                        <div className="mx-2 avatar">
                            <div className="rounded-full h-7">
                                {userAvatar ? (
                                    <img
                                        src={userAvatar}
                                        alt="User avatar"
                                        className="object-cover w-full h-full rounded-full"
                                    />
                                ) : (
                                    <div
                                        className="flex items-center justify-center w-full h-full bg-gray-300 rounded-full">
            <span className="text-sm font-semibold">
                {getInitials(userName)}
            </span>
                                    </div>
                                )}
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
                                    {role === "moderator" || role === "admin" ? (
                                        <li>
                                            {isPinned ? (
                                                <button onClick={() => unpinPost()}>
                                                    Unpin Post
                                                </button>
                                            ) : (
                                                <button onClick={() => pinpost()}>
                                                    Pin Post
                                                </button>
                                            )}
                                        </li>
                                    ) : null}

                                    {authorId === user.id ? (
                                        <div>
                                            <li><Link to={`/community/${community}/post/${postId}/edit`}>Edit</Link>
                                            </li>
                                            <li><Link to={`/community/${community}/post/${postId}/delete`}>Delete</Link>
                                            </li>
                                        </div>
                                    ) : (
                                        <li>
                                            <button
                                                onClick={() => document.getElementById(`PostModal${postId}`).showModal()}>Report
                                            </button>
                                        </li>
                                    )}


                                    <dialog id={`PostModal${postId}`} className="modal">
                                        <ReportForm type={"post"} object={postId} community={community}/>
                                    </dialog>


                                </ul>
                            </div>
                        </div>
                    </div>
                    <Link to={`/community/${community}/post/${postId}`}>
                        <h2 className="card-title">{postTitle}</h2>
                    </Link>

                    <article className="prose max-w-none lg:prose-lg text-overflow: ellipsis">
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
    isPinned: PropTypes.bool,
};

export default CommunityPost;
