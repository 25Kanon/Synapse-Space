import React, { useEffect, useState } from "react";
import axios from "axios";
import CommentItem from "./CommentItem";

const CommentList = ({ onUpdate, onDelete, onReply, postId }) => {
    const [comments, setComments] = useState([]);
    const API_URL = process.env.REACT_APP_API_BASE_URI;

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/posts/${postId}/comments/`,{
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    },
                });
                const { data } = response;
                setComments(data);
            } catch (error) {
                console.error("Error fetching comments:", error);
            }
        };

        fetchComments();
    }, []);

    return (
        <div className="space-y-4">
            {comments.map((comment) => (
                <CommentItem
                    key={comment.id}
                    comment={comment}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onReply={onReply}
                />
            ))}
        </div>
    );
};

export default CommentList;