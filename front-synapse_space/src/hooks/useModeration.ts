import { useEffect, useState } from 'react';
import type { Report, ModSettings } from '../components/community/types';
import AxiosInstance from '../utils/AxiosInstance'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const initialSettings: ModSettings = {
    autoModEnabled: true,
    reportThreshold: 5,
    wordFilterEnabled: true,
    bannedWords: ['spam', 'abuse', 'hate'],
    newUserRestriction: 7,
    notificationsEnabled: true,
    autoLockThreshold: 10
};

export function useModeration(id: number) {
    const [reports, setReports] = useState([]);
    const [filter, setFilter] = useState<'all' | 'posts' | 'comments' | 'users'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [notifications, setNotifications] = useState(2);
    const [settings, setSettings] = useState<ModSettings>(initialSettings);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [statCount, setStatCount] = useState();

    const [unformattedReports, setUnformattedReports] = useState([]);

    // Fetch moderation settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await AxiosInstance.get(`/api/moderator/settings/${id}`, {
                    withCredentials: true,
                });
                setSettings(response.data);
            } catch (error) {
                toast.error(`Error fetching moderation settings: ${error.message}`);
            }
        };
        if (id) {
            fetchSettings();
        }
    }, [id]);


    const fetchStats = async () => {
        try {
            const response = await AxiosInstance.get(`/api/community/${id}/stats`, {}, { withCredentials: true, });
            setStatCount(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
            throw error;
        }
    };


    const fetchReports = async () => {
        try {
            const response = await AxiosInstance.get(`/api/community/${id}/reports`, {}, { withCredentials: true, });
            setReports(response.data);
            //console.log(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
            throw error;
        }
    };

    useEffect(() => {
        fetchStats();
        fetchReports();
    }, []);

    const handleApprove = async (reportId: string) => {
        try {
            await AxiosInstance.put(`/api/community/${id}/reports/resolve/${reportId}/`,
                { status: 'approved' },
                { withCredentials: true }
            );
            setReports(prev => prev.map(report =>
                report.id === reportId ? { ...report, status: 'approved' } : report
            ));
        } catch (error) {
            console.error('Error approving report:', error);
            // Handle error (e.g., show user notification)
        }
    };


    const handleReject = async (reportId: string) => {
        try {
            await AxiosInstance.put(`/api/community/${id}/reports/resolve/${reportId}/`,
                { status: 'rejected' },
                { withCredentials: true }
            );
            setReports(prev => prev.map(report =>
                report.id === reportId ? { ...report, status: 'rejected' } : report
            ));
        } catch (error) {
            console.error('Error approving report:', error);
            // Handle error (e.g., show user notification)
        }
    };

    // Function to save updated settings
    const handleSettingsSave = async (updatedSettings) => {
        try {
            const response = await AxiosInstance.put(`/api/moderator/settings/${id}/`, updatedSettings, {
                withCredentials: true,
            });
            setSettings(response.data);
        } catch (error) {
            toast.error(`Error saving settings: ${error.message}`);
        }
    };

    const filteredReports = reports
        .filter(report => {
            if (filter === 'all') return true;
            if (filter === 'posts') return report.type === 'post' && report.status === 'pending';
            if (filter === 'comments') return report.type === 'comment' && report.status === 'pending';
            if (filter === 'users') return report.type === 'user' && report.status === 'pending';
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
    // console.log(statCount);


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