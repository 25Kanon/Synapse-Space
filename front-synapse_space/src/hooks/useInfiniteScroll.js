import { useState, useEffect } from 'react';

export const useInfiniteScroll = (fetchCallback, dependencies = []) => {
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [error, setError] = useState(null);
    const [initialLoad, setInitialLoad] = useState(true);
    const [shouldLoadMore, setShouldLoadMore] = useState(false);

    const loadMore = async () => {
        if (loading || (!hasMore && !initialLoad)) return;

        setLoading(true);
        try {
            const response = await fetchCallback(page);
            if (response && response.data && response.data.results) {
                const newItems = response.data.results;

                setItems((prev) => {
                    const existingIds = new Set(prev.map((item) => item.id));
                    const filteredNewItems = newItems.filter((item) => !existingIds.has(item.id));
                    return initialLoad ? newItems : [...prev, ...filteredNewItems];
                });

                if (response.data.next) {
                    const urlParams = new URL(response.data.next).searchParams;
                    const nextPage = parseInt(urlParams.get('page'), 10) || page + 1;
                    setPage(nextPage);
                    setHasMore(true);
                } else {
                    setHasMore(false);
                }

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

    useEffect(() => {
        setInitialLoad(true);
        setItems([]);
        setPage(1);
        setHasMore(true);
        setShouldLoadMore(true);
    }, dependencies);

    useEffect(() => {
        if (shouldLoadMore) {
            setShouldLoadMore(false);
            loadMore();
        }
    }, [shouldLoadMore]);

    return { loading, items, hasMore, loadMore, error };
};