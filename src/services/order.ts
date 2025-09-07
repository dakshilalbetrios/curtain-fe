import { BaseService, ApiResponse, PaginatedApiResponse, PaginationParams, SearchParams } from './types';

// Order interfaces
export interface OrderItem {
  id: number;
  order_id: number;
  collection_sr_no_id: number;
  quantity: string;
  created_by: number;
  created_at: string;
  updated_by: number | null;
  updated_at: string | null;
  collection_details: {
    name: string;
    description: string;
    sr_no: string;
    current_stock: string;
    unit: string;
  };
  created_by_name: string;
  updated_by_name: string | null;
}

export interface OrderResponse {
  id: number;
  status: 'PENDING' | 'APPROVED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  created_by: number;
  created_at: string;
  updated_by: number | null;
  updated_at: string | null;
  creator: any;
  updater: any;
  order_items: OrderItem[];
  courier_tracking_no?: string;
  courier_company?: string;
}

export interface CreateOrderRequest {
  order_items: {
    collection_sr_no_id: number;
    quantity: number;
  }[];
}

export interface UpdateOrderStatusRequest {
  status: 'PENDING' | 'APPROVED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  courier_tracking_no?: string;
  courier_company?: string;
}


// Order service
export class OrderService extends BaseService {
  async getAllOrders(): Promise<OrderResponse[]> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.BASE_URL}/orders`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiResponse<OrderResponse[]> = await response.json();

      if (apiResponse.error) {
        throw new Error(apiResponse.message);
      }

      return apiResponse.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching orders');
    }
  }

  async getOrdersPaginated(params: PaginationParams): Promise<PaginatedApiResponse<OrderResponse[]>> {
    try {
      const queryParams = new URLSearchParams({
        page: params.page.toString(),
        limit: params.limit.toString(),
      });

      const response = await this.makeAuthenticatedRequest(`${this.BASE_URL}/orders?${queryParams}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const apiResponse: PaginatedApiResponse<OrderResponse[]> = await response.json();

      if (apiResponse.error) {
        throw new Error(apiResponse.message);
      }

      return apiResponse;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching orders');
    }
  }

  async searchOrdersPaginated(params: SearchParams): Promise<PaginatedApiResponse<OrderResponse[]>> {
    try {
      const queryParams = new URLSearchParams({
        page: params.page.toString(),
        limit: params.limit.toString(),
      });

      if (params.search) {
        queryParams.append('id_like', params.search);
        queryParams.append('courier_tracking_no_like', params.search);
      }

      const response = await this.makeAuthenticatedRequest(`${this.BASE_URL}/orders?${queryParams}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const apiResponse: PaginatedApiResponse<OrderResponse[]> = await response.json();

      if (apiResponse.error) {
        throw new Error(apiResponse.message);
      }

      return apiResponse;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while searching orders');
    }
  }

  async getOrderById(id: number): Promise<OrderResponse> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.BASE_URL}/orders/${id}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiResponse<OrderResponse> = await response.json();

      if (apiResponse.error) {
        throw new Error(apiResponse.message);
      }

      return apiResponse.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching order');
    }
  }

  async createOrder(orderData: CreateOrderRequest): Promise<OrderResponse> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.BASE_URL}/orders`, {
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiResponse<OrderResponse> = await response.json();

      if (apiResponse.error) {
        throw new Error(apiResponse.message);
      }

      return apiResponse.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while creating order');
    }
  }

  async updateOrderStatus(id: number, payload: UpdateOrderStatusRequest): Promise<OrderResponse> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.BASE_URL}/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiResponse<OrderResponse> = await response.json();

      if (apiResponse.error) {
        throw new Error(apiResponse.message);
      }

      return apiResponse.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while updating order status');
    }
  }

  async cancelOrder(id: number): Promise<OrderResponse> {
    return this.updateOrderStatus(id, { status: 'CANCELLED' });
  }

  async getOrdersByStatus(status: OrderResponse['status']): Promise<OrderResponse[]> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.BASE_URL}/orders?status=${status}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiResponse<OrderResponse[]> = await response.json();

      if (apiResponse.error) {
        throw new Error(apiResponse.message);
      }

      return apiResponse.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching orders by status');
    }
  }

  async getOrdersByUser(userId: number): Promise<OrderResponse[]> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.BASE_URL}/orders?user_id=${userId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiResponse<OrderResponse[]> = await response.json();

      if (apiResponse.error) {
        throw new Error(apiResponse.message);
      }

      return apiResponse.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching orders by user');
    }
  }
}

export const orderService = new OrderService();