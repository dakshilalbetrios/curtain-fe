import { useInfiniteScroll } from './useInfiniteScroll';
import { orderService, OrderResponse } from '../services';

export function useOrders() {
    return useInfiniteScroll<OrderResponse>({
        fetchFunction: async (page: number, limit: number) => {
            const response = await orderService.getOrdersPaginated({ page, limit });
            return {
                data: response.data,
                pagination: response.pagination,
            };
        },
        limit: 20,
    });
}
