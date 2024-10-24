import { useState } from 'react';
import type { Report, ModSettings } from '../components/community/types';

const initialReports: Report[] = [
    {
        id: '1',
        type: 'post',
        content: 'This is a reported post content that needs moderation...',
        author: 'user123',
        reason: 'Harassment',
        timestamp: '2024-03-10T10:30:00Z',
        reports: 5,
        status: 'pending'
    },
    {
        id: '2',
        type: 'comment',
        content: 'This is a reported comment that violates community guidelines...',
        author: 'commenter456',
        reason: 'Spam',
        timestamp: '2024-03-10T11:15:00Z',
        reports: 3,
        status: 'pending'
    }
];

const initialSettings: ModSettings = {
    autoModEnabled: true,
    reportThreshold: 5,
    wordFilterEnabled: true,
    bannedWords: ['spam', 'abuse', 'hate'],
    newUserRestriction: 7,
    notificationsEnabled: true,
    autoLockThreshold: 10
};

export function useModeration() {
    const [reports, setReports] = useState<Report[]>(initialReports);
    const [filter, setFilter] = useState<'all' | 'posts' | 'comments' | 'users'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [notifications, setNotifications] = useState(2);
    const [settings, setSettings] = useState<ModSettings>(initialSettings);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const handleApprove = (id: string) => {
        setReports(prev => prev.map(report =>
            report.id === id ? { ...report, status: 'approved' } : report
        ));
    };

    const handleReject = (id: string) => {
        setReports(prev => prev.map(report =>
            report.id === id ? { ...report, status: 'rejected' } : report
        ));
    };

    const handleSettingsSave = (newSettings: ModSettings) => {
        setSettings(newSettings);
        // In a real app, you'd save these settings to a backend
        console.log('Settings saved:', newSettings);
    };

    const filteredReports = reports
        .filter(report => {
            if (filter === 'all') return true;
            if (filter === 'posts') return report.type === 'post';
            if (filter === 'comments') return report.type === 'comment';
            return false;
        })
        .filter(report =>
            report.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            report.author.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const stats = {
        activeUsers: 2451,
        pendingReports: reports.filter(r => r.status === 'pending').length,
        modActions: reports.filter(r => r.status !== 'pending').length,
        activityScore: 92
    };

    return {
        reports: filteredReports,
        filter,
        setFilter,
        searchQuery,
        setSearchQuery,
        notifications,
        setNotifications,
        handleApprove,
        handleReject,
        stats,
        settings,
        isSettingsOpen,
        setIsSettingsOpen,
        handleSettingsSave
    };
}