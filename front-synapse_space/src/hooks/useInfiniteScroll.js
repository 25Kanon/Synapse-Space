import { useState, useEffect } from 'react';

export const useInfiniteScroll = (fetchCallback, dependencies = []) => {
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [error, setError] = useState(null);
    const [initialLoad, setInitialLoad] = useState(true);

    const loadMore = async () => {
        if (loading || (!hasMore && !initialLoad)) return;

        setLoading(true);
        try {
            const response = await fetchCallback(page);

            if (response && response.data && response.data.results) {
                const newItems = response.data.results;

                setItems(prev => initialLoad ? newItems : [...prev, ...newItems]);
                setHasMore(!!response.data.next);
                setPage(prev => prev + 1);
                setError(null);
                setInitialLoad(false);
            } else {
                setHasMore(false);
            }
        } catch (err) {
            setError("Unexpected Error");
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };

    // Reset on dependency change (e.g., community change)
    useEffect(() => {
        setInitialLoad(true);
        setItems([]);
        setPage(1);
        setHasMore(true);
        loadMore();  // Trigger loading of posts based on new dependencies
    }, dependencies);

    return { loading, items, hasMore, loadMore, error };
};
