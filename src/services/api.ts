import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api/v1';

// Create axios instance with default config
const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // This enables sending cookies with requests
});

// Request interceptor for logging (no auth header needed with cookies)
api.interceptors.request.use(
    (config) => {
        console.log('API Request:', config.method?.toUpperCase(), config.url);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response: AxiosResponse) => {
        console.log('API Response:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('API Error:', error.response?.status, error.response?.data, error.config?.url);

        if (error.response?.status === 401) {
            console.log('Unauthorized request - redirecting to login');
            // Unauthorized - redirect to login (cookies will be cleared by backend)
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Types for API responses
export interface ApiResponse<T = any> {
    error: boolean;
    message: string;
    data: T;
}

export interface User {
    id: number;
    name: string;
    mobile_no: string;
    shop_name: string;
    status: string;
    role: string;
    created_at: string;
    created_by: number;
    updated_at: string | null;
    updated_by: number | null;
    creator?: {
        name: string | null;
        mobile_no: string | null;
        role: string | null;
    };
    updater?: {
        name: string | null;
        mobile_no: string | null;
        role: string | null;
    };
}

export interface LoginRequest {
    mobile_no: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    token?: string;
}

export interface CreateUserRequest {
    name: string;
    mobile_no: string;
    shop_name: string;
    password: string;
    role: string;
    status: string;
}

export interface Collection {
    id: number;
    name: string;
    description: string;
    created_at: string;
    created_by: number;
    updated_at: string | null;
    updated_by: number | null;
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
    serial_numbers: SerialNumber[];
}

export interface SerialNumber {
    id: number;
    collection_id: number;
    sr_no: string;
    min_stock: string;
    max_stock: string;
    current_stock: string;
    unit: string;
    created_at: string;
    created_by: number;
    updated_at: string | null;
    updated_by: number | null;
}

export interface OrderItem {
    collection_sr_no_id: number;
    quantity: number;
}

export interface CreateOrderRequest {
    order_items: OrderItem[];
}

export interface OrderItemResponse {
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

export interface Order {
    id: number;
    status: string;
    created_by: number;
    created_at: string;
    updated_by: number | null;
    updated_at: string | null;
    creator: any;
    updater: any;
    order_items: OrderItemResponse[];
}

// Auth API
export const authAPI = {
    login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    logout: async (): Promise<ApiResponse<any>> => {
        const response = await api.post('/auth/logout');
        return response.data;
    },
};

// Users API
export const usersAPI = {
    getAll: async (): Promise<ApiResponse<User[]>> => {
        const response = await api.get('/users');
        console.log("users response", response.data);
        return response.data;
    },

    create: async (userData: CreateUserRequest): Promise<ApiResponse<User>> => {
        const response = await api.post('/users', userData);
        return response.data;
    },

    createBulk: async (usersData: CreateUserRequest[]): Promise<ApiResponse<User[]>> => {
        const response = await api.post('/users/bulk', usersData);
        return response.data;
    },
};

// Collections API
export const collectionsAPI = {
    getAll: async (): Promise<ApiResponse<Collection[]>> => {
        const response = await api.get('/collections');
        console.log("collections response", response.data);
        return response.data;
    },

    getById: async (id: number): Promise<ApiResponse<Collection>> => {
        const response = await api.get(`/collections/${id}`);
        console.log("collection detail response", response.data);
        return response.data;
    },

    create: async (collectionData: Partial<Collection>): Promise<ApiResponse<Collection>> => {
        const response = await api.post('/collections', collectionData);
        return response.data;
    },
};

// Orders API
export const ordersAPI = {
    create: async (orderData: CreateOrderRequest): Promise<ApiResponse<Order>> => {
        const response = await api.post('/orders', orderData);
        return response.data;
    },

    getAll: async (): Promise<ApiResponse<Order[]>> => {
        const response = await api.get('/orders');
        return response.data;
    },

    getById: async (id: number): Promise<ApiResponse<Order>> => {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },
};

export default api;
