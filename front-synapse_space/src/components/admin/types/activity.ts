import type { LucideIcon } from 'lucide-react';

export interface Reply {
    author_pic: string;
    created_at: string;
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