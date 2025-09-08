// import dotenv from 'dotenv';


// Common API response wrapper
export interface ApiResponse<T> {
  error: boolean;
  message: string;
  data: T;
}

// Pagination response wrapper
export interface PaginatedApiResponse<T> {
  error: boolean;
  message: string;
  data: T;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Pagination parameters
export interface PaginationParams {
  page: number;
  limit: number;
}

// Search parameters
export interface SearchParams extends PaginationParams {
  search?: string;
}

// Filter parameters for orders
export interface OrderFilterParams extends PaginationParams {
  search?: string;
  status_in?: string;
}

// Collection Access Management Types
export interface CollectionAccess {
  id: number;
  customer_user_id: number;
  collection_id: number;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED' | 'EXPIRED';
  created_at: string;
  created_by: number;
  updated_at: string | null;
  updated_by: number | null;
  customer: {
    name: string;
    mobile_no: string;
    role: string;
  };
  collection: {
    name: string;
    description: string;
  };
  creator: {
    name: string;
    mobile_no: string;
    role: string;
  };
  updater: {
    name: string | null;
    mobile_no: string | null;
    role: string | null;
  };
}

export interface CollectionAccessResponse {
  data: CollectionAccess[];
  pagination: any;
}

export interface AddCollectionAccessRequest {
  collectionIds: number[];
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED' | 'EXPIRED';
}

export interface UpdateCollectionAccessRequest {
  updates: Array<{
    collectionId: number;
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED' | 'EXPIRED';
  }>;
}

// Base service class for common functionality
export abstract class BaseService {
  protected BASE_URL = 'http://localhost:3000/api/v1';

  protected async simulateApiCall<T>(data: T, delay: number = 500): Promise<T> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(data), delay);
    });
  }

  // Helper method to make authenticated requests with cookies
  protected async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    return fetch(url, {
      ...options,
      credentials: 'include', // Always include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }
}
