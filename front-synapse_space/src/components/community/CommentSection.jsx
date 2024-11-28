import React, { useContext, useEffect, useState } from "react";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";
import AuthContext from "../../context/AuthContext";
import AxiosInstance from "../../utils/AxiosInstance";

const CommentSection = ({ postID }) => {
    const [comments, setComments] = useState([]);
    const { user } = useContext(AuthContext);

    const API_URL = import.meta.env.VITE_API_BASE_URI;
    // Fetch and sort comments initially
    const fetchComments = async () => {
        try {
            const response = await AxiosInstance.get(`/api/posts/${postID}/comments/`, { withCredentials: true });
            const sortedComments = sortComments(response.data); // Sort by vote_score
            setComments(sortedComments);
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    // Sort comments by vote_score in descending order
    const sortComments = (commentsList) => {
        return [...commentsList].sort((a, b) => b.vote_score - a.vote_score);
    };

    useEffect(() => {
        fetchComments();
    }, [postID]);

    const addComment = async (content, parentId = null) => {
        try {
            await AxiosInstance.post(
                `/api/comments/`,
                { content, parent: parentId, post: postID },
                { withCredentials: true }
            );
            fetchComments(); // Refetch and sort comments after adding a new one
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    const handleVote = async (commentId, voteType) => {
        try {
            const url = `/api/comments/${commentId}/${voteType}/`;
            await AxiosInstance.post(url, { withCredentials: true });

            // Update and sort comments
            setComments((prevComments) => {
                const updatedComments = prevComments.map((comment) => {
                    if (comment.id === commentId) {
                        const isSwitchingVote = comment.user_vote && comment.user_vote !== voteType;

                        // Calculate new vote score
                        const newVoteScore =
                            voteType === "upvote"
                                ? isSwitchingVote
                                    ? comment.vote_score + 2
                                    : comment.vote_score + 1
                                : voteType === "downvote"
                                    ? isSwitchingVote
                                        ? comment.vote_score - 2
                                        : comment.vote_score - 1
                                    : comment.vote_score;

                        return {
                            ...comment,
                            user_vote: voteType === comment.user_vote ? null : voteType,
                            vote_score: newVoteScore,
                        };
                    }
                    return comment;
                });

                // Always return a new array reference with sorted comments
                return [...updatedComments].sort((a, b) => b.vote_score - a.vote_score);
            });
        } catch (error) {
            console.error("Error voting on comment:", error);
        }
    };

    const updateComment = async (id, content) => {
        const updateCommentRecursive = (comments) => {
            return comments.map((comment) => {
                if (comment.id === id) {
                    return { ...comment, content, updatedAt: new Date().toISOString() };
                }
                if (comment.replies.length > 0) {
                    return {
                        ...comment,
                        replies: updateCommentRecursive(comment.replies),
                    };
                }
                return comment;
            });
        };

        try {
            await AxiosInstance.put(`${API_URL}/api/comments/update/${id}/`, { content }, {withCredentials: true});
            setComments(updateCommentRecursive(comments));
        } catch (error) {
            console.error("Error updating comment:", error);
        }
    };

    const deleteComment = async (id) => {
        const deleteCommentRecursive = (comments) => {
            return comments.filter((comment) => {
                if (comment.id === id) {
                    return false;
                }
                if (comment.replies.length > 0) {
                    comment.replies = deleteCommentRecursive(comment.replies);
                }
                return true;
            });
        };

        try {
            await AxiosInstance.delete(`${API_URL}/api/comments/delete/${id}/`, {withCredentials: true});
            setComments(deleteCommentRecursive(comments));
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    return (
        <div className="w-full mx-auto mt-8">
            <h2 className="text-2xl font-bold mb-4" id="comments">
                Comments
            </h2>
            <CommentForm onSubmit={(content) => addComment(content)} />
            <CommentList
                postID={postID}
                comments={comments}
                onReply={addComment}
                onVote={handleVote}
                onUpdate={updateComment}
                onDelete={deleteComment}
                refetchComments={fetchComments}
            />
        </div>
    );
};

export default CommentSection;
