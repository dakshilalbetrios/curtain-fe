import { BaseService, ApiResponse, CollectionAccess, CollectionAccessResponse, AddCollectionAccessRequest, UpdateCollectionAccessRequest } from './types';

// User interfaces
export interface UserResponse {
  id: number;
  name: string;
  mobile_no: string;
  shop_name: string;
  status: 'ACTIVE' | 'INACTIVE';
  role: 'ADMIN' | 'SALES' | 'CUSTOMER';
  created_at: string;
  created_by: number;
  updated_at: string | null;
  updated_by: number | null;
  creator: {
    name: string | null;
    mobile_no: string | null;
    role: string | null;
  };
  updater: {
    name: string | null;
    mobile_no: string | null;
    role: string | null;
  };
}

export interface CreateRetailerRequest {
  name: string;
  mobile_no: string;
  password?: string | null;
  shop_name: string;
  role: 'ADMIN' | 'SALES' | 'CUSTOMER';
  status: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateProfileRequest {
  name: string;
  mobile_no: string;
  shop_name: string;
  role?: "ADMIN" | "SALES" | "CUSTOMER";
  status?: "ACTIVE" | "INACTIVE";
}

export interface UserExistsResponse {
  error: boolean;
  message: string;
  data?: {
    id: number;
    name: string;
    mobile_no: string;
    shop_name: string;
    hashed_password: string | null;
    status: string;
    role: string;
    created_at: string;
    created_by: number;
    updated_at: string;
    updated_by: number;
  };
}

export interface SetPasswordRequest {
  mobile_no: string;
  password: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}


// User service
export class UserService extends BaseService {
  async getAllUsers(): Promise<UserResponse[]> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.BASE_URL}/users`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiResponse<UserResponse[]> = await response.json();

      if (apiResponse.error) {
        throw new Error(apiResponse.message);
      }

      return apiResponse.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching users');
    }
  }

  async searchUsers(searchTerm: string): Promise<UserResponse[]> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.BASE_URL}/users?name_like=${encodeURIComponent(searchTerm)}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiResponse<UserResponse[]> = await response.json();

      if (apiResponse.error) {
        throw new Error(apiResponse.message);
      }

      return apiResponse.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while searching users');
    }
  }

  async getUserById(id: number): Promise<UserResponse> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.BASE_URL}/users/${id}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiResponse<UserResponse> = await response.json();

      if (apiResponse.error) {
        throw new Error(apiResponse.message);
      }

      return apiResponse.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching user');
    }
  }

  async addRetailer(retailerData: CreateRetailerRequest): Promise<UserResponse> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.BASE_URL}/users`, {
        method: 'POST',
        body: JSON.stringify(retailerData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiResponse<UserResponse> = await response.json();

      if (apiResponse.error) {
        throw new Error(apiResponse.message);
      }

      return apiResponse.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while adding retailer');
    }
  }

  async updateProfile(userId: number, profileData: UpdateProfileRequest): Promise<UserResponse> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.BASE_URL}/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiResponse<UserResponse> = await response.json();

      if (apiResponse.error) {
        throw new Error(apiResponse.message);
      }

      return apiResponse.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while updating profile');
    }
  }

  async updateUserStatus(id: number, status: 'ACTIVE' | 'INACTIVE'): Promise<UserResponse> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.BASE_URL}/users/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiResponse<UserResponse> = await response.json();

      if (apiResponse.error) {
        throw new Error(apiResponse.message);
      }

      return apiResponse.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while updating user status');
    }
  }

  async changePassword(request: ChangePasswordRequest): Promise<boolean> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.BASE_URL}/users/change-password`, {
        method: 'POST',
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiResponse<{ success: boolean }> = await response.json();

      if (apiResponse.error) {
        throw new Error(apiResponse.message);
      }

      return apiResponse.data.success;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while changing password');
    }
  }

  async bulkUploadUsers(usersData: CreateRetailerRequest[]): Promise<{
    createdUsers: any[];
    errors: string[];
    message: string;
    successCount: number;
    errorCount: number;
  }> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.BASE_URL}/users/bulk`, {
        method: 'POST',
        body: JSON.stringify(usersData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiResponse<{
        createdUsers: any[];
        errors: string[];
        message: string;
      }> = await response.json();

      if (apiResponse.error) {
        throw new Error(apiResponse.message);
      }

      return {
        createdUsers: apiResponse.data.createdUsers,
        errors: apiResponse.data.errors,
        message: apiResponse.data.message,
        successCount: apiResponse.data.createdUsers.length,
        errorCount: apiResponse.data.errors.length,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while bulk uploading users');
    }
  }

  async deleteUser(userId: number): Promise<boolean> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.BASE_URL}/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiResponse<{ success: boolean }> = await response.json();

      if (apiResponse.error) {
        throw new Error(apiResponse.message);
      }

      return apiResponse.data.success;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while deleting user');
    }
  }

  // Collection Access Management Methods
  async getUserCollectionAccess(userId: number): Promise<CollectionAccess[]> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.BASE_URL}/users/${userId}/collections`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiResponse<CollectionAccessResponse> = await response.json();

      if (apiResponse.error) {
        throw new Error(apiResponse.message);
      }

      return apiResponse.data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching user collection access');
    }
  }

  async addCollectionAccess(userId: number, request: AddCollectionAccessRequest): Promise<boolean> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.BASE_URL}/users/${userId}/collections`, {
        method: 'POST',
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiResponse<{ success: boolean }> = await response.json();

      if (apiResponse.error) {
        throw new Error(apiResponse.message);
      }

      return apiResponse.data.success;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while adding collection access');
    }
  }

  async updateCollectionAccess(userId: number, request: UpdateCollectionAccessRequest): Promise<boolean> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.BASE_URL}/users/${userId}/collections/bulk`, {
        method: 'PUT',
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiResponse<{ success: boolean }> = await response.json();

      if (apiResponse.error) {
        throw new Error(apiResponse.message);
      }

      return apiResponse.data.success;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while updating collection access');
    }
  }

  async checkUserExists(mobileNo: string): Promise<UserExistsResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/users/is-exists?mobileNo=${mobileNo}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const apiResponse: UserExistsResponse = await response.json();
      return apiResponse;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while checking user existence');
    }
  }

  async setPassword(request: SetPasswordRequest): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/users/set-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiResponse<{ success: boolean }> = await response.json();

      if (apiResponse.error) {
        throw new Error(apiResponse.message);
      }

      return apiResponse.data.success;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while setting password');
    }
  }

}

export const userService = new UserService();