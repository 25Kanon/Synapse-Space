import {useEffect, useState} from 'react';
import type { Report, ModSettings } from '../components/community/types';
import AxiosInstance from '../utils/AxiosInstance'


const initialSettings: ModSettings = {
    autoModEnabled: true,
    reportThreshold: 5,
    wordFilterEnabled: true,
    bannedWords: ['spam', 'abuse', 'hate'],
    newUserRestriction: 7,
    notificationsEnabled: true,
    autoLockThreshold: 10
};

export function useModeration(id:number) {
    const [reports, setReports] = useState([]);
    const [filter, setFilter] = useState<'all' | 'posts' | 'comments' | 'users'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [notifications, setNotifications] = useState(2);
    const [settings, setSettings] = useState<ModSettings>(initialSettings);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [statCount, setStatCount]= useState();

    const [unformattedReports, setUnformattedReports] = useState([]);


    const fetchStats = async () => {
        try {
            const response = await AxiosInstance.get(`/api/community/${id}/stats`, {}, { withCredentials: true,});
            setStatCount(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
            throw error;
        }
    };


    const fetchReports = async () => {
        try {
            const response = await AxiosInstance.get(`/api/community/${id}/reports`, {}, { withCredentials: true,});
            setReports(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
            throw error;
        }
    };

    useEffect(() => {
        fetchStats();
        fetchReports();
    }, []);

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
        activeUsers: statCount?.members ?? 0,
        pendingReports: reports.filter(r => r.status === 'pending').length,
        modActions: reports.filter(r => r.status !== 'pending').length,
        postCount: statCount?.posts ?? 0
    };
    console.log(statCount);


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