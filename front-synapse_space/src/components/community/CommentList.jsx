import React from "react";
import CommentItem from "./CommentItem";

const CommentList = ({ onUpdate, onDelete, onReply, comments, refetchComments }) => {
    // Sort comments by vote score in descending order
    const sortedComments = [...comments].sort(
        (a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes)
    );

    return (
        <div className="space-y-4">
            {sortedComments.map((comment) => (
                <CommentItem
                    key={comment.id}
                    comment={comment}
                    onReply={(content, parentId) => {
                        // Pass the correct parentId for replies
                        onReply(content, parentId);
                        refetchComments();
                    }}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};

export default CommentList;
