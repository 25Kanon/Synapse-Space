export interface User {
    id: number;
    name: string;
    email: string;
    role: 'Admin' | 'Moderator' | 'Member';
    status: 'Active' | 'Inactive';
    lastActive: string;
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

export interface ApiError {
    message: string;
    code?: string;
    status?: number;
}