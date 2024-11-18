import { useState, useEffect } from 'react';
import { ActivityLog } from "../components/admin/types/activity";
import AxiosInstance from '../utils/AxiosInstance';

export function useActivityData() {
    const [data, setData] = useState<ActivityLog | null>(null); // Initialize with null
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                const response = await AxiosInstance.get<ActivityLog>('/api/admin/user-activity-log/', { withCredentials: true });

                setData(response.data); // Axios provides parsed JSON directly in `response.data`
            } catch (err) {
                console.error('Error fetching activity data:', err);
                setError(err instanceof Error ? err : new Error('An unknown error occurred'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    return { data, isLoading, error };
}
