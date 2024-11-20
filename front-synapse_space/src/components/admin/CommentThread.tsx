import { MessageCircle } from 'lucide-react';
import type { Reply } from './types/activity';
import React from 'react';

interface CommentThreadProps {
    author: string;
    authorPic: string;
    timestamp: string;
    replies: Reply[];
    depth?: number;
}

export function CommentThread({author, authorPic, timestamp, replies, depth = 0 }: CommentThreadProps) {
    const maxDepth = 3;

    return (
        <div className={`${depth > 0 ? 'ml-8 mt-3' : ''}`}>
            <div className="flex items-start gap-3">
                <img
                    src={authorPic}
                    alt="User"
                    className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div className="flex-1 bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MessageCircle className="w-4 h-4"/>
                        <span>{author} {`${depth > 0 ? 'made a reply' : 'made a comment'}`}</span>
                        <time dateTime={timestamp}>
                            {new Date(timestamp).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </time>
                    </div>
                </div>
            </div>

            {depth < maxDepth && replies.map((reply, index) => (
                <CommentThread
                    key={index}
                    author={reply.author}
                    authorPic={reply.author_pic}
                    timestamp={reply.created_at}
                    replies={reply.replies}
                    depth={depth + 1}
                />
            ))}
        </div>
    );
}