import { useInfiniteScroll } from './useInfiniteScroll';
import { collectionService, CollectionResponse } from '../services';

export function useCollections() {
    return useInfiniteScroll<CollectionResponse>({
        fetchFunction: async (page: number, limit: number) => {
            const response = await collectionService.getCollectionsPaginated({ page, limit });
            return {
                data: response.data,
                pagination: response.pagination,
            };
        },
        limit: 20,
    });
}
