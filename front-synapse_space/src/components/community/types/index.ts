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