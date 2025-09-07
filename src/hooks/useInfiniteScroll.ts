import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseInfiniteScrollOptions<T> {
    fetchFunction: (page: number, limit: number, search?: string) => Promise<{
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
    searchTerm?: string; // Search term for filtering
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
    searchTerm = '',
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
    const searchTermRef = useRef(searchTerm);


    const loadMore = useCallback(() => {
        if (!loadingMore && hasMore && enabled) {
            // Call fetchData directly without including it in dependencies
            const loadMoreData = async () => {
                try {
                    setLoadingMore(true);
                    setError(null);

                    const response = await fetchFunction(currentPage + 1, limit, searchTermRef.current);

                    setData(prev => [...prev, ...response.data]);
                    setTotal(response.pagination.total);
                    setCurrentPage(response.pagination.page);
                    setTotalPages(response.pagination.pages);
                    setHasMore(response.pagination.page < response.pagination.pages);

                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'An error occurred';
                    setError(errorMessage);
                } finally {
                    setLoadingMore(false);
                }
            };

            loadMoreData();
        }
    }, [loadingMore, hasMore, enabled, currentPage, fetchFunction, limit]);

    const refresh = useCallback(() => {
        setCurrentPage(1);
        setHasMore(true);

        // Call fetchData directly without including it in dependencies
        const loadData = async () => {
            if (!enabled) return;

            try {
                setLoading(true);
                setError(null);

                const response = await fetchFunction(1, limit, searchTermRef.current);

                setData(response.data);
                setTotal(response.pagination.total);
                setCurrentPage(response.pagination.page);
                setTotalPages(response.pagination.pages);
                setHasMore(response.pagination.page < response.pagination.pages);

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An error occurred';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [enabled, fetchFunction, limit]);

    const reset = useCallback(() => {
        setData([]);
        setCurrentPage(1);
        setTotal(0);
        setTotalPages(0);
        setHasMore(true);
        setError(null);
        isInitialLoad.current = true;
    }, []);

    // Update search term ref when it changes
    useEffect(() => {
        searchTermRef.current = searchTerm;
    }, [searchTerm]);

    // Initial load and search term change
    useEffect(() => {
        if (enabled) {
            if (isInitialLoad.current) {
                isInitialLoad.current = false;
            } else {
                // Reset data when search term changes
                setData([]);
                setCurrentPage(1);
                setHasMore(true);
            }

            // Call fetchData directly without including it in dependencies
            const loadData = async () => {
                if (!enabled) return;

                try {
                    setLoading(true);
                    setError(null);

                    const response = await fetchFunction(1, limit, searchTermRef.current);

                    setData(response.data);
                    setTotal(response.pagination.total);
                    setCurrentPage(response.pagination.page);
                    setTotalPages(response.pagination.pages);
                    setHasMore(response.pagination.page < response.pagination.pages);

                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'An error occurred';
                    setError(errorMessage);
                } finally {
                    setLoading(false);
                }
            };

            loadData();
        }
    }, [enabled, searchTerm, fetchFunction, limit]);

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
