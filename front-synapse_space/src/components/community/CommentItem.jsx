import React, {useState, useContext, useEffect, useRef} from "react";
import CommentForm from "./CommentForm";
import { Trash2, Edit, MessageCircle } from "lucide-react";
import AuthContext from "../../context/AuthContext";
import {useLocation} from "react-router-dom";

const CommentItem = ({ comment, onUpdate, onDelete, onReply, optionalClasses }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const commentRef = useRef(null);

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
        // Pass the current comment's id as the parent_id for the reply
        onReply(content, comment.id);
        setIsReplying(false);
    };

    useEffect(() => {
        // Extract the ID from the URL hash
        const hash = location.hash;
        if (hash) {
            const id = hash.substring(1);
            const element = document.getElementById(id);
            console.log(element);

            if (element) {
                // Scroll to the element
                element.scrollIntoView({ behavior: "smooth", block: "center" });

                // Add a temporary highlight class
                element.classList.add("border");

                // Remove the highlight class after a few seconds
                setTimeout(() => {
                    element.classList.remove("border");
                }, 5000); // 2000 ms (2 seconds)
            }
        }
    }, [location.hash]); // Re-run if the hash in the URL changes

    return (
        <>
            <div id={`comment-${comment.id}`} ref={commentRef} className={` rounded-lg bg-base-100 mb-4 p-3 shadow-lg border-primary ${optionalClasses}`}>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span className="font-semibold mr-2">{comment.author}</span>
                    <span>{new Date(comment.created_at).toLocaleString()}</span>
                </div>
                {isEditing ? (
                    <CommentForm onSubmit={handleUpdate} initialValue={comment.content} />
                ) : (
                    <>
                        <p className="mb-2">{comment.content}</p>
                        <div className="mt-2 space-x-2">
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
                        </div>
                    </>
                )}
                {isReplying && (
                    <div className="mt-4">
                        <CommentForm onSubmit={handleSubmitReply} />
                    </div>
                )}
            </div>
            {comment.replies && comment.replies.length > 0 && (
                <div className="ml-8 mt-4 space-y-4">
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            onReply={onReply}
                            optionalClasses="bg-base-100 shadow-2xl"
                        />
                    ))}
                </div>
            )}
        </>
    );
};

export default CommentItem;
