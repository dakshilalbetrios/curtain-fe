import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseInfiniteScrollOptions<T> {
    fetchFunction: (page: number, limit: number) => Promise<{
        data: T[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    limit?: number;
    enabled?: boolean;
    threshold?: number; // Distance from bottom to trigger load more
}

export interface UseInfiniteScrollReturn<T> {
    data: T[];
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
    hasMore: boolean;
    total: number;
    currentPage: number;
    totalPages: number;
    loadMore: () => void;
    refresh: () => void;
    reset: () => void;
    loadMoreRef: React.RefObject<HTMLDivElement>;
}

export function useInfiniteScroll<T>({
    fetchFunction,
    limit = 20,
    enabled = true,
    threshold = 100,
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);
    const isInitialLoad = useRef(true);

    const fetchData = useCallback(async (page: number, isLoadMore = false) => {
        if (!enabled) return;

        try {
            if (isLoadMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }
            setError(null);

            const response = await fetchFunction(page, limit);

            if (isLoadMore) {
                setData(prev => [...prev, ...response.data]);
            } else {
                setData(response.data);
            }

            setTotal(response.pagination.total);
            setCurrentPage(response.pagination.page);
            setTotalPages(response.pagination.pages);
            setHasMore(response.pagination.page < response.pagination.pages);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [fetchFunction, limit, enabled]);

    const loadMore = useCallback(() => {
        if (!loadingMore && hasMore && enabled) {
            fetchData(currentPage + 1, true);
        }
    }, [loadingMore, hasMore, enabled, currentPage, fetchData]);

    const refresh = useCallback(() => {
        setCurrentPage(1);
        setHasMore(true);
        fetchData(1, false);
    }, [fetchData]);

    const reset = useCallback(() => {
        setData([]);
        setCurrentPage(1);
        setTotal(0);
        setTotalPages(0);
        setHasMore(true);
        setError(null);
        isInitialLoad.current = true;
    }, []);

    // Initial load
    useEffect(() => {
        if (enabled && isInitialLoad.current) {
            isInitialLoad.current = false;
            fetchData(1, false);
        }
    }, [enabled, fetchData]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        if (!enabled) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting && hasMore && !loadingMore && !loading) {
                    loadMore();
                }
            },
            {
                rootMargin: `${threshold}px`,
            }
        );

        observerRef.current = observer;

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [hasMore, loadingMore, loading, loadMore, threshold, enabled]);

    return {
        data,
        loading,
        loadingMore,
        error,
        hasMore,
        total,
        currentPage,
        totalPages,
        loadMore,
        refresh,
        reset,
        loadMoreRef,
    };
}
