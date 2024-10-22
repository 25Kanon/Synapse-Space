import React from "react";
import CommentItem from "./CommentItem";

const CommentList = ({ onUpdate, onDelete, onReply, comments, refetchComments }) => {
    return (
        <div className="space-y-4">
            {comments.map((comment) => (
                <CommentItem
                    key={comment.id}
                    comment={comment}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onReply={(content, parentId) => {
                        // Pass the correct parentId for replies
                        onReply(content, parentId);
                        refetchComments();
                    }}
                />
            ))}
        </div>
    );
};

export default CommentList;