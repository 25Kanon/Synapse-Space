import type { LucideIcon } from 'lucide-react';

export interface Reply {
    author: string;
    author_pic: string;
    created_at: string;
    name: string;
    last_login: string;
    replies: Reply[];
}

export interface Comment {
    author: string;
    author_pic: string;
    created_at: string;
    replies: Reply[];
}

export interface ActivityLog {
    posts: {
        created_by: string;
        author_pic: string;
        created_at: string;
    }[];
    comments: Comment[];
    liked_posts: {
        username: string;
        author_pic: string;
        created_at: string;
    }[];
    saved_posts: {
        author_pic: string;
        created_at: string;
    }[];
}



export interface TabInfo {
    id: string;
    label: string;
    icon: LucideIcon;
}

export type TimeRange = 'day' | 'week' | 'month' | 'year';
export type Metric = 'all' | 'posts' | 'comments' | 'liked_posts';

export interface EngagementData {
    timestamp: string;
    posts: number;
    comments: number;
    liked_posts: number;
}