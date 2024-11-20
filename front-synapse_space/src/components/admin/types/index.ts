export interface User {
    id: number;
    name: string;
    email: string;
    role: 'Admin' | 'Moderator' | 'Member';
    status: 'Active' | 'Inactive';
    lastActive: string;
    student_number: number;
    first_name: string;
    last_name: string;
    username: string;
    bio: string;
    profile_pic: string;
    profile_banner: string;
    program: string;
    interests: string[];
    approval: 'pending' | 'approved' | 'rejected';
    is_verified: boolean;
    registration_form: string;
    is_rejected: boolean;
}


interface ActivityLog {
    posts: Post[];
    comments: Comment[];
    liked_posts: LikedPost[];
    saved_posts: SavedPost[];
}

interface Post {
    created_by: number;
    created_at: string;
    'author_pic': string;
}

interface Comment {
    id: number;
    content: string;
    author: string;
    created_at: string;
    updated_at: string;
    parent: number | null;
    post: number;
    replies: Comment[];
}

interface LikedPost {
    user: number;
    post: number;
    created_at: string;
}

interface SavedPost {
    user?: number;
    post?: number;
    created_at?: string;
}



