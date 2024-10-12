import React, { useContext, useEffect, useState } from "react";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";
import axios from "axios";
import AuthContext from "../../context/AuthContext";

const CommentSection = ({ postID }) => {
    const [comments, setComments] = useState([]);
    const { user } = useContext(AuthContext);
    const API_URL = process.env.REACT_APP_API_BASE_URI;

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/posts/${postID}/comments/`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    },
                });
                setComments(response.data);
            } catch (error) {
                console.error("Error fetching comments:", error);
            }
        };

        fetchComments();
    }, [postID]);

    const addComment = async (content, parentId = null) => {
        const newComment = {
            content,
            parent: parentId,
            post: postID,
        };

        const addReplyRecursive = (comments) => {
            return comments.map((comment) => {
                if (comment.id === parentId) {
                    return { ...comment, replies: [...comment.replies, newComment] };
                } else if (comment.replies.length > 0) {
                    return { ...comment, replies: addReplyRecursive(comment.replies) };
                }
                return comment;
            });
        };

        try {
            const response = await axios.post(`${API_URL}/api/comments/`, newComment, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
            });
            const { data } = response;
            if (parentId === null) {
                setComments([...comments, data]);
            } else {
                setComments(addReplyRecursive(comments));
            }
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
            await axios.put(`${API_URL}/api/comments/${id}`, { content }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
            });
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
            await axios.delete(`${API_URL}/api/comments/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
            });
            setComments(deleteCommentRecursive(comments));
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    return (
        <div className="w-full mx-auto mt-8">
            <h2 className="text-2xl font-bold mb-4">Comments</h2>
            <CommentForm onSubmit={(content) => addComment(content)} />
            <CommentList
                postId={postID}
                comments={comments}
                onUpdate={updateComment}
                onDelete={deleteComment}
                onReply={addComment}
            />
        </div>
    );
};

export default CommentSection;