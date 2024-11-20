import React from 'react';
import { ActivityCard } from './ActivityCard';
import { CommentThread } from './CommentThread';
import {ActivityLog} from "./types/activity";


interface ActivitySectionProps {
    title: string;
    data: ActivityLog[keyof ActivityLog];
    type: 'post' | 'comment' | 'like';
    limit?: number;
}

export function ActivitySection({ title, data, type, limit }: ActivitySectionProps) {
    if (!Array.isArray(data) || data.length === 0) {
        return (
            <section className="py-4">
                <h3 className="text-lg font-semibold mb-4">{title}</h3>
                <p className="text-gray-500 text-sm">No {type}s found</p>
            </section>
        );
    }

    const items = limit ? data.slice(0, limit) : data;

    return (
        <section>
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <div className="space-y-4">
                {type === 'comment'
                    ? items.map((item: any, i) => (
                        <CommentThread
                            key={`${type}-${i}`}
                            authorPic={item.author_pic}
                            timestamp={item.created_at}
                            replies={item.replies}
                            author={item.author}
                        />
                    ))
                    : items.map((item: any, i) => (
                        <ActivityCard
                            key={`${type}-${i}`}
                            author={item.author || item.username || item.created_by_username}
                            authorPic={item.author_pic}
                            timestamp={item.created_at}
                            type={type}
                        />
                    ))}
            </div>
        </section>
    );
}