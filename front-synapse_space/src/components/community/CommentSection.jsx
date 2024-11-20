import React, { useContext, useEffect, useState } from "react";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";
import axios from "axios";
import AuthContext from "../../context/AuthContext";
import AxiosInstance  from "../../utils/AxiosInstance";
const CommentSection = ({ postID }) => {
    const [comments, setComments] = useState([]);
    const { user } = useContext(AuthContext);
    const API_URL = import.meta.env.VITE_API_BASE_URI;

    const fetchComments = async () => {
        try {
            const response = await AxiosInstance.get(`/api/posts/${postID}/comments/`, { withCredentials: true });
            setComments(response.data);
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [postID]);

    const addComment = async (content, parentId = null) => {
        const newComment = {
            content,
            parent: parentId,  // Now passing correct parent ID for replies
            post: postID,
        };

        try {
            await AxiosInstance.post(`/api/comments/`, newComment, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            // Refetch comments after adding a new comment
            fetchComments();
        } catch (error) {
            console.error("Error adding comment:", error);
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
            <h2 className="text-2xl font-bold mb-4" id="comments">Comments</h2>
            <CommentForm onSubmit={(content) => addComment(content)} />
            <CommentList
                postId={postID}
                comments={comments}
                onUpdate={updateComment}
                onDelete={deleteComment}
                onReply={addComment}
                refetchComments={fetchComments}
            />
        </div>
    );
};

export default CommentSection;