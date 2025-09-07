import { useCallback } from 'react';
import { useInfiniteScroll } from './useInfiniteScroll';
import { orderService, OrderResponse } from '../services';

export function useOrders(searchTerm?: string) {
    const fetchFunction = useCallback(async (page: number, limit: number, search?: string) => {
        const response = search
            ? await orderService.searchOrdersPaginated({ page, limit, search })
            : await orderService.getOrdersPaginated({ page, limit });
        return {
            data: response.data,
            pagination: response.pagination,
        };
    }, []);

    return useInfiniteScroll<OrderResponse>({
        fetchFunction,
        limit: 20,
        searchTerm,
    });
}
