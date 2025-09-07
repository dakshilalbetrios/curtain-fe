import { useCallback } from 'react';
import { useInfiniteScroll } from './useInfiniteScroll';
import { userService, UserResponse } from '../services';

export function useUsers(searchTerm?: string) {
    const fetchFunction = useCallback(async (page: number, limit: number, search?: string) => {
        const response = search
            ? await userService.searchUsersPaginated({ page, limit, search })
            : await userService.getUsersPaginated({ page, limit });
        return {
            data: response.data,
            pagination: response.pagination,
        };
    }, []);

    return useInfiniteScroll<UserResponse>({
        fetchFunction,
        limit: 15,
        searchTerm,
    });
}
