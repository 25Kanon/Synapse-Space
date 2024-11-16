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


export interface CommunityStats {
    totalUsers: number;
    activeUsers: number;
    totalPosts: number;
    newUsersToday: number;
    engagementRate: string;
}

export interface Activity {
    id: number;
    user: string;
    action: string;
    timestamp: string;
    type: 'post' | 'report' | 'join' | 'other';
}

