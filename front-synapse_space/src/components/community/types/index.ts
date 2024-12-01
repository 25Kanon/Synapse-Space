export type Report = {
    id: string;
    type: 'post' | 'comment' | 'user';
    content: string;
    author: string;
    reason: string;
    timestamp: string;
    reports: number;
    comment_post_id: number;
    object_id:number;
    status: 'pending' | 'approved' | 'rejected';
};

export type Approvals ={
    id: string;
    type: 'post' | 'user';
    object_id: number;
    status: 'pending' | 'approved' | 'rejected' | 'banned';
}

export type Stats = {
    activeUsers: number;
    pendingReports: number;
    modActions: number;
    postCount: number;
};

export type ModSettings = {
    autoModEnabled: boolean;
    reportThreshold: number;
    wordFilterEnabled: boolean;
    bannedWords: string[];
    newUserRestriction: number;
    notificationsEnabled: boolean;
    autoLockThreshold: number;
};


export interface Participant {
    id: number;
    activity: number;
    user: number;
    user_name: string;
    user_pic: string;
}


export interface CommunityActivity {
    id: number;
    title: string;
    description: string;
    created_at: string; // ISO date string
    location: string;
    organizer: number; // Organizer's user ID
    organizer_name: string;
    organizer_pic: string;
    community: number;
    max_participants: number;
    image: string | null;
    status: "Upcoming" | "Ongoing" | "Completed";
    startDate: string; // ISO date string
    endDate: string;
    // ISO date string
}


export interface ActivitySentiment {
    positive: number;
    neutral: number;
    negative: number;
}

export interface ActivityRating {
    user: number;
    activity: number;
    rating: number;
    comment?: string;
    sentiment?: string;
}