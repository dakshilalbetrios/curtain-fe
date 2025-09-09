import { BaseService, ApiResponse } from './types';

// Auth interfaces
export interface LoginRequest {
  mobile_no: string;
  password: string;
}

import { UserStatus, UserRole } from '../constants';

export interface AuthUser {
  id: number;
  name: string;
  mobile_no: string;
  shop_name: string;
  hashed_password: string;
  status: UserStatus;
  role: UserRole;
  created_at: string;
  created_by: number;
  updated_at: string | null;
  updated_by: number | null;
}

export interface LoginResponse {
  user: AuthUser;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

// Auth service
export class AuthService extends BaseService {
  private isAuthenticated = false;
  public currentUser: AuthUser | null = null;

  async login(mobile_no: string, password: string): Promise<AuthUser> {
    try {
      const response = await fetch(`${this.BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: Include cookies in the request
        body: JSON.stringify({
          mobile_no,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      const apiResponse: ApiResponse<LoginResponse> = JSON.parse(responseText);


      if (apiResponse.error) {
        throw new Error(apiResponse.message);
      }

      // Store authentication state
      this.isAuthenticated = true;
      this.currentUser = apiResponse.data.user;

      return apiResponse.data.user;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred during login');
    }
  }


  // Helper method to get authentication headers for API calls
  getAuthHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
    };
  }

  // Get current user
  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  // Check if user is authenticated
  isUserAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  // Verify current session and get user data
  async verifySession(): Promise<AuthUser | null> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.BASE_URL}/auth/profile`, {
        method: 'GET',
      });

      if (!response.ok) {
        // If session is invalid, clear local state
        this.isAuthenticated = false;
        this.currentUser = null;
        return null;
      }

      const apiResponse: ApiResponse<LoginResponse> = await response.json();

      if (apiResponse.error) {
        this.isAuthenticated = false;
        this.currentUser = null;
        return null;
      }

      // Update authentication state
      this.isAuthenticated = true;
      this.currentUser = apiResponse.data.user;
      return apiResponse.data.user;
    } catch (error) {
      // If verification fails, clear local state
      this.isAuthenticated = false;
      this.currentUser = null;
      return null;
    }
  }

  // Logout method
  async logout(): Promise<boolean> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.BASE_URL}/auth/logout`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Clear authentication state
      this.isAuthenticated = false;
      this.currentUser = null;

      return true;
    } catch (error) {
      // Even if logout fails on server, clear local state
      this.isAuthenticated = false;
      this.currentUser = null;

      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred during logout');
    }
  }
}

export const authService = new AuthService();