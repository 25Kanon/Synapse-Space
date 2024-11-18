import React from "react";
import { Link } from "react-router-dom";

const CommentsTab = ({ userComments }) => {
    return (
        <div>
            <h2 className="mb-4 font-semibold text-black">Your Comments</h2>
            {userComments.length > 0 ? (
                userComments
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Sort from present to past
                    .map((comment) => (
                        <div
                            key={comment.id}
                            className="p-4 mb-4 bg-gray-100 rounded-lg hover:shadow-lg"
                        >
                            <div className="flex items-center justify-between">
                            <p className="text-lg font-bold text-black">
                                {comment.post_title}
                            </p>
                                <span className="text-sm text-black">
                                    {new Date(comment.created_at).toLocaleString()}
                                </span>
                            </div>
                            <p className="text-sm text-black">
                                Community: {comment.post_community}
                            </p>
                            <Link
                                    to={`/community/${comment.post_community_id}/post/${comment.post_id}#comment-${comment.id}`} // Dynamic link to the specific comment
                                    className="mt-2 text-black underline hover:text-blue-500"
                                >
                                    {comment.content}
                            </Link>
                        </div>
                    ))
            ) : (
                <p className="text-black">No comments to display.</p>
            )}
        </div>
    );
};

export default CommentsTab;
