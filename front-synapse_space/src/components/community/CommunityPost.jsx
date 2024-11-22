import React, { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import "@mdxeditor/editor/style.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsDown, faThumbsUp } from "@fortawesome/free-regular-svg-icons";
import { faThumbsDown as ThumbsDownIcon, faThumbsUp as ThumbsUpIcon } from "@fortawesome/free-solid-svg-icons";
import Checkbox from "@mui/material/Checkbox";
import { faComment } from "@fortawesome/free-solid-svg-icons/faComment";
import { FormControlLabel } from "@mui/material";
import AxiosInstance from "../../utils/AxiosInstance";
import CommentSection from "./CommentSection";
import StyledOutput from "./StyledOutput";
import AuthContext from "../../context/AuthContext";
import ReportForm from "../../components/ReportForm";
import { format } from "date-fns";
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
    createdAt,
}) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likes, setLikes] = useState(0);
    const [isDisliked, setIsDisliked] = useState(false);
    const [dislikes, setDislikes] = useState(0);
    const { user } = useContext(AuthContext);
    const [role, setRole] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    // Like/Dislike Handlers
    const handleLikeChange = () => {
        const url = `/api/community/${community}/post/${postId}/${isLiked ? "unlike" : "like"}`;
        AxiosInstance.post(url, { postId }, { withCredentials: true })
            .then(response => {
                if (response.status === 200 || response.status === 201) {
                    setIsLiked(!isLiked);
                    if (isLiked) setLikes(likes - 1);
                    else setLikes(likes + 1);

                    // Ensure dislike is removed if toggled
                    if (isDisliked) {
                        setIsDisliked(false);
                        setDislikes(dislikes - 1);
                    }
                }
            })
            .catch(error => {
                console.error("Error occurred while changing like status:", error);
            });
    };

    const handleDislikeChange = () => {
        const url = `/api/community/${community}/post/${postId}/${isDisliked ? "undislike" : "dislike"}`;
        AxiosInstance.post(url, { postId }, { withCredentials: true })
            .then(response => {
                if (response.status === 200 || response.status === 201) {
                    setIsDisliked(!isDisliked);
                    if (isDisliked) setDislikes(dislikes - 1);
                    else setDislikes(dislikes + 1);

                    // Ensure like is removed if toggled
                    if (isLiked) {
                        setIsLiked(false);
                        setLikes(likes - 1);
                    }
                }
            })
            .catch(error => {
                console.error("Error occurred while changing dislike status:", error);
            });
    };

    useEffect(() => {
        const fetchLikeDislikeStatus = async () => {
            try {
                const likesData = await AxiosInstance.get(`/api/community/${community}/post/${postId}/likes`, {}, { withCredentials: true });
                const dislikesData = await AxiosInstance.get(`/api/community/${community}/post/${postId}/dislikes`, {}, { withCredentials: true });

                if (likesData.status === 200) {
                    setLikes(likesData.data.length);
                    if (likesData.data.some(like => like.user === userID)) {
                        setIsLiked(true);
                    }
                }

                if (dislikesData.status === 200) {
                    setDislikes(dislikesData.data.length);
                    if (dislikesData.data.some(dislike => dislike.user === userID)) {
                        setIsDisliked(true);
                    }
                }
            } catch (error) {
                console.error("Error fetching like/dislike status:", error);
            }
        };

        fetchLikeDislikeStatus();
    }, [community, postId, userID]);

    // Navigate to comments section
    const handleNavigate = () => {
        navigate(`/community/${community}/post/${postId}/#comments`);
    };

    const pinPost = async () => {
        try {
            const response = await AxiosInstance.post(`/api/community/${community}/post/${postId}/pin/`, {}, { withCredentials: true });
            console.log("Post pinned successfully", response);
        } catch (error) {
            console.error("Error pinning post:", error);
        }
    };

    const unpinPost = async () => {
        try {
            const response = await AxiosInstance.post(`/api/community/${community}/post/${postId}/unpin/`, {}, { withCredentials: true });
            console.log("Post unpinned successfully", response);
            setIsPinned(false);
        } catch (error) {
            console.error("Error unpinning post:", error);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await AxiosInstance.delete(`/api/community/${community}/post/delete/${postId}/`, { withCredentials: true });
            console.log("Post deleted successfully");
            if (location.pathname === "/") {
                window.location.href = `/`;
            } else {
                window.location.href = `/community/${community}`;
            }
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    };
    return (
        <>
            <div key={postId} className={`w-full my-5 border border-solid shadow-xl card card-compact ${isPinned ? "border-amber-400" : ""}`}>
                <div className="card-body ">
                    {/* Post Header */}
                    <div className="flex justify-between items-center h-5">
                        {/* Left: Avatar and Author Info */}
                        <Link to={`/profile/user/${authorId}`}>
                            <div className="flex items-center">
                                <div className="mx-2 avatar">
                                    <div className="rounded-full h-7 cursor-pointer">
                                        {userAvatar ? (
                                            <img
                                                src={userAvatar}
                                                alt="User avatar"
                                                className="object-cover w-full h-full rounded-full"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full bg-gray-300 rounded-full">
                                                <span className="text-sm font-semibold">{userName.charAt(0)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm font-semibold">{userName}</p>
                            </div>
                        </Link>

                        {/* Right: Dropdown Menu */}
                        <div className="dropdown dropdown-end">
                            <label tabIndex={0} className="btn btn-ghost btn-circle">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                    />
                                </svg>
                            </label>
                            <ul
                                tabIndex={0}
                                className="p-2 shadow menu dropdown-content bg-secondary rounded-box w-52"
                            >
                                {role === "moderator" || role === "admin" ? (
                                    <li>
                                        {isPinned ? (
                                            <button onClick={unpinPost}>Unpin Post</button>
                                        ) : (
                                            <button onClick={pinPost}>Pin Post</button>
                                        )}
                                    </li>
                                ) : null}
                                {authorId === user.id ? (
                                    <>
                                        <li>
                                            <Link
                                                to={{
                                                    pathname: `/community/${community}/post/${postId}`,
                                                }}
                                                state={{ isEditing: true }}
                                            >
                                                Edit
                                            </Link>
                                        </li>
                                        <li>
                                            <button onClick={handleDelete}>Delete</button>
                                        </li>
                                    </>
                                ) : (
                                    <li>
                                        <button
                                            onClick={() =>
                                                document.getElementById(`PostModal${postId}`).showModal()
                                            }
                                        >
                                            Report
                                        </button>
                                    </li>
                                )}
                            </ul>
                        </div>

                        {/* Report Modal */}
                        <dialog id={`PostModal${postId}`} className="modal">
                            <ReportForm type={"post"} object={postId} community={community} />
                        </dialog>
                    </div>
                    {/* Post Content */}
                    <p className="text-sm">{createdAt ? format(new Date(createdAt), "eeee, MMMM dd yyyy hh:mm:ss a") : ""}</p>
                    <Link to={`/community/${community}/post/${postId}`}>
                        <h2 className="card-title">{postTitle}</h2>
                    </Link>
                    <article className="prose max-w-none lg:prose-lg">
                        <StyledOutput data={JSON.parse(postContent)} />
                    </article>
                </div>

                {/* Like/Dislike Buttons */}
                <div className="flex flex-row m-4 gap-4">
                    <FormControlLabel
                        control={
                            <Checkbox
                                onChange={handleLikeChange}
                                checked={isLiked}
                                icon={<FontAwesomeIcon className="text-xl text-current text-secondary dark:text-neutral-300" icon={faThumbsUp} />}
                                checkedIcon={<FontAwesomeIcon className="text-xl" icon={ThumbsUpIcon} />}
                            />
                        }
                        label={likes}
                        labelPlacement="end"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                onChange={handleDislikeChange}
                                checked={isDisliked}
                                icon={<FontAwesomeIcon className="text-xl text-current text-secondary dark:text-neutral-300" icon={faThumbsDown} />}
                                checkedIcon={<FontAwesomeIcon className="text-xl" icon={ThumbsDownIcon} />}
                            />
                        }
                        label={dislikes}
                        labelPlacement="end"
                    />
                    <button className="btn btn-circle" onClick={handleNavigate}>
                        <FontAwesomeIcon icon={faComment} className="text-current" />
                    </button>
                </div>

                {/* Comments Section */}
                {showComments && (
                    <div className="m-5">
                        <CommentSection postID={postId} />
                    </div>
                )}
            </div >
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

export default CommunityPost;
