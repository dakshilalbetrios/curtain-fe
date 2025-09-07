import { useCallback } from 'react';
import { useInfiniteScroll } from './useInfiniteScroll';
import { collectionService, CollectionResponse } from '../services';

export function useCollections(searchTerm?: string) {
    const fetchFunction = useCallback(async (page: number, limit: number, search?: string) => {
        const response = search
            ? await collectionService.searchCollectionsPaginated({ page, limit, search })
            : await collectionService.getCollectionsPaginated({ page, limit });
        return {
            data: response.data,
            pagination: response.pagination,
        };
    }, []);

    return useInfiniteScroll<CollectionResponse>({
        fetchFunction,
        limit: 20,
        searchTerm,
    });
}
