// Common API response wrapper
export interface ApiResponse<T> {
  error: boolean;
  message: string;
  data: T;
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
