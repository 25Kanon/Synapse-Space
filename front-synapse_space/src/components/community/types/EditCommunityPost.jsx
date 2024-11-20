import React, { useContext, useEffect, useState } from "react";
import PropTypes from 'prop-types';
import '@mdxeditor/editor/style.css';
import {Link, useNavigate} from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp } from "@fortawesome/free-regular-svg-icons/faThumbsUp";
import { faThumbsUp as ThumbsUpIcon } from "@fortawesome/free-solid-svg-icons/faThumbsUp";
import Checkbox from '@mui/material/Checkbox';
import { faComment } from "@fortawesome/free-solid-svg-icons/faComment";
import { FormControlLabel } from "@mui/material";
import AxiosInstance from '../../utils/AxiosInstance';
import CommentSection from './CommentSection';
import StyledOutput from "./StyledOutput";
import AuthContext from "../../context/AuthContext";
import ReportForm from "../../components/ReportForm";
import { format } from 'date-fns';

const EditCommunityPost = ({
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
                           createdAt,
                       }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likes, setLikes] = useState(0);
    const { user } = useContext(AuthContext);
    const [role, setRole] = useState('');
    const communityID = community;
    const getInitials = (name) => {
        return name.split(' ').map(word => word[0]).join('');
    };
    const navigate = useNavigate();

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
                                    <div className="flex items-center justify-center w-full h-full bg-gray-300 rounded-full">
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
                    </div>
                </div>
            </div>
        </>
    );
};

CommunityPost.propTypes = {
    userName: PropTypes.string,
    userAvatar: PropTypes.string,
    community: PropTypes.number.isRequired,
    postTitle: PropTypes.string.isRequired,
    postContent: PropTypes.string.isRequired,
    postId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    createdAt: PropTypes.string.isRequired,
    showComments: PropTypes.bool,
    authorId: PropTypes.number,
    isPinned: PropTypes.bool,
};

export default EditCommunityPost;