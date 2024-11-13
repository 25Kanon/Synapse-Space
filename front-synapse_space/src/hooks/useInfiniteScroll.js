import { useState, useEffect } from 'react';

export const useInfiniteScroll = (fetchCallback) => {
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadMore();
    }, []);

    const loadMore = async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            const response = await fetchCallback(page);
            const newItems = response.data.results;
            
            setItems(prev => [...prev, ...newItems]);
            setHasMore(!!response.data.next);
            setPage(prev => prev + 1);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { loading, items, hasMore, loadMore, error };
};