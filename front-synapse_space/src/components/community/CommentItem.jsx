import React, {useState, useContext, useEffect, useRef} from "react";
import { ArrowUp, ArrowDown, Trash2, Edit, MessageCircle, Flag } from "lucide-react";
import AuthContext from "../../context/AuthContext";
import AxiosInstance from "../../utils/AxiosInstance";
import CommentForm from "./CommentForm";
import ReportForm from "../ReportForm";

const CommentItem = ({ comment, onReply, onUpdate, onDelete, optionalClasses, postID }) => {
    const [userVote, setUserVote] = useState(comment.user_vote || null); // 'upvote', 'downvote', or null
    const [voteScore, setVoteScore] = useState(comment.vote_score || 0);
    const [isEditing, setIsEditing] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const { user } = useContext(AuthContext);

    const handleVote = async (voteType) => {
        try {
            if (userVote === voteType) {
                setUserVote(null);
                setVoteScore(voteScore + (voteType === "upvote" ? -1 : 1));
                await AxiosInstance.post(`/api/comments/${comment.id}/remove-vote/`, { withCredentials: true });
            } else {
                setUserVote(voteType);
                setVoteScore(
                    voteScore +
                    (voteType === "upvote" ? 1 : -1) +
                    (userVote ? (userVote === "upvote" ? -1 : 1) : 0)
                );
                await AxiosInstance.post(`/api/comments/${comment.id}/${voteType}/`, { withCredentials: true });
            }
        } catch (error) {
            console.error(`Error handling ${voteType}:`, error);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleUpdate = (content) => {
        onUpdate(comment.id, content);
        setIsEditing(false);
    };

    const handleDelete = () => {
        onDelete(comment.id);
    };

    const handleReply = () => {
        setIsReplying(true);
    };

    const handleSubmitReply = (content) => {
        onReply(content, comment.id);
        setIsReplying(false);
    };

    useEffect(() => {
        const hash = location.hash;
        if (hash) {
            const id = hash.substring(1);
            const element = document.getElementById(id);
            console.log(element);

            if (element) {
                // Scroll to the element
                element.scrollIntoView({ behavior: "smooth", block: "center" });

                // Add a temporary highlight class
                element.classList.add("border-primary");

                // Remove the highlight class after a few seconds
                setTimeout(() => {
                    element.classList.remove("border-primary");
                }, 5000); // 2000 ms (2 seconds)
            }
        }
    }, [location.hash]);

    return (
        <div className={`comment-item flex flex-col p-4 border rounded-lg shadow-sm ${optionalClasses}`} id={`comment-${comment.id}`}>
            <div className="flex items-start space-x-4">
                <div className="vote-controls flex flex-col items-center">
                    <button
                        onClick={() => handleVote("upvote")}
                        className={`text-gray-500 hover:text-green-500 ${userVote === "upvote" ? "text-green-500" : ""}`}
                    >
                        <ArrowUp size={20} />
                    </button>
                    <span className="text-gray-800 dark:text-gray-200 font-semibold">{voteScore}</span>
                    <button
                        onClick={() => handleVote("downvote")}
                        className={`text-gray-500 hover:text-red-500 ${userVote === "downvote" ? "text-red-500" : ""}`}
                    >
                        <ArrowDown size={20} />
                    </button>
                </div>
                <div className="comment-content flex-1">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500">{comment.author}</span>
                        <span className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleString()}</span>
                    </div>
                    {isEditing ? (
                        <CommentForm onSubmit={handleUpdate} initialValue={comment.content} />
                    ) : (
                        <p className="text-gray-800 dark:text-gray-200">{comment.content}</p>
                    )}
                    <div className="mt-2 flex space-x-2">
                        {user.username === comment.author && (
                            <>
                                <button onClick={handleEdit} className="text-blue-500 hover:text-blue-700">
                                    <Edit size={16} />
                                </button>
                                <button onClick={handleDelete} className="text-red-500 hover:text-red-700">
                                    <Trash2 size={16} />
                                </button>
                            </>
                        )}
                        <button onClick={handleReply} className="text-green-500 hover:text-green-700">
                            <MessageCircle size={16} />
                        </button>
                        {user.username !== comment.author && (
                            <button
                                onClick={() => document.getElementById(`CommentModal${comment.id}`).showModal()}
                                className="text-red-500 hover:text-red-700"
                            >
                                <Flag size={16} />
                            </button>
                        )}
                    </div>
                    <dialog id={`CommentModal${comment.id}`} className="modal">
                        <ReportForm
                            type="comment"
                            object={comment.id}
                            community={comment.post_community_id}
                            comment_post_id={postID}
                        />
                    </dialog>
                </div>
            </div>
            {isReplying && (
                <div className="mt-4">
                    <CommentForm onSubmit={handleSubmitReply} />
                </div>
            )}
            {comment.replies.length > 0 && (
                <div className="ml-8 mt-4 space-y-4">
                    {[...comment.replies]
                        .sort((a, b) => b.vote_score - a.vote_score) // Sort replies by vote_score
                        .map((reply) => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                onReply={onReply}
                                onUpdate={onUpdate}
                                onDelete={onDelete}
                            />
                        ))}
                </div>
            )}
        </div>
    );
};

export default CommentItem;
