export type Report = {
    id: string;
    type: 'post' | 'comment';
    content: string;
    author: string;
    reason: string;
    timestamp: string;
    reports: number;
    status: 'pending' | 'approved' | 'rejected';
};

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