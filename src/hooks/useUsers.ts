import { useInfiniteScroll } from './useInfiniteScroll';
import { userService, UserResponse } from '../services';

export function useUsers() {
    return useInfiniteScroll<UserResponse>({
        fetchFunction: async (page: number, limit: number) => {
            const response = await userService.getUsersPaginated({ page, limit });
            return {
                data: response.data,
                pagination: response.pagination,
            };
        },
        limit: 15,
    });
}
