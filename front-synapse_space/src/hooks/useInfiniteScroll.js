import { useState, useEffect, useCallback } from 'react';

export function useInfiniteScroll(fetchCallback, initialPage = 1) {
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(initialPage);
    const [items, setItems] = useState([]);

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            const response = await fetchCallback(page);
            const newItems = response.data.results;
            setItems(prev => [...prev, ...newItems]);
            setHasMore(response.data.next !== null);
            setPage(prev => prev + 1);
        } catch (error) {
            console.error('Error loading more items:', error);
        } finally {
            setLoading(false);
        }
    }, [fetchCallback, page, loading, hasMore]);

    return { loading, hasMore, items, loadMore };
}