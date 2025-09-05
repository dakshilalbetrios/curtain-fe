import { BaseService, ApiResponse } from './types';

// Collection interfaces
export interface CollectionSerialNumber {
  id: number;
  collection_id: number;
  sr_no: string;
  min_stock: string;
  max_stock: string;
  current_stock: string;
  unit: 'mtr' | 'pcs';
  created_at: string;
  created_by: number;
  updated_at: string | null;
  updated_by: number | null;
}

export interface CollectionResponse {
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
  serial_numbers: CollectionSerialNumber[];
}

export interface CreateCollectionRequest {
  name: string;
  description: string;
  serial_numbers: {
    sr_no: string;
    min_stock: string;
    max_stock: string;
    current_stock: string;
    unit: 'mtr' | 'pcs';
  }[];
}

export interface UpdateCollectionRequest {
  name: string;
  description: string;
  serial_numbers: Array<{
    _action: 'create' | 'update' | 'delete';
    sr_no?: string;
    min_stock?: string;
    max_stock?: string;
    current_stock?: string;
    unit?: 'mtr' | 'pcs';
    id?: number;
  }>;
}

export interface UpdateStockRequest {
  collection_sr_no_id: number;
  current_stock: string;
}


// Collection service
export class CollectionService extends BaseService {
  async getAllCollections(): Promise<CollectionResponse[]> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.BASE_URL}/collections`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiResponse<CollectionResponse[]> = await response.json();

      if (apiResponse.error) {
        throw new Error(apiResponse.message);
      }

      return apiResponse.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching collections');
    }
  }

  async getCollectionById(id: number): Promise<CollectionResponse> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.BASE_URL}/collections/${id}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiResponse<CollectionResponse> = await response.json();

      if (apiResponse.error) {
        throw new Error(apiResponse.message);
      }

      return apiResponse.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching collection');
    }
  }

  async createCollection(collectionData: CreateCollectionRequest): Promise<CollectionResponse> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.BASE_URL}/collections`, {
        method: 'POST',
        body: JSON.stringify(collectionData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiResponse<CollectionResponse> = await response.json();

      if (apiResponse.error) {
        throw new Error(apiResponse.message);
      }

      return apiResponse.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while creating collection');
    }
  }

  async updateStock(stockData: UpdateStockRequest): Promise<CollectionSerialNumber> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.BASE_URL}/collections/stock`, {
        method: 'PUT',
        body: JSON.stringify(stockData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiResponse<CollectionSerialNumber> = await response.json();

      if (apiResponse.error) {
        throw new Error(apiResponse.message);
      }

      return apiResponse.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while updating stock');
    }
  }

  async deleteCollection(id: number): Promise<boolean> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.BASE_URL}/collections/${id}`, {
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
      throw new Error('An unexpected error occurred while deleting collection');
    }
  }

  async updateCollection(id: number, collectionData: UpdateCollectionRequest): Promise<CollectionResponse> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.BASE_URL}/collections/${id}`, {
        method: 'PUT',
        body: JSON.stringify(collectionData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiResponse<CollectionResponse> = await response.json();

      if (apiResponse.error) {
        throw new Error(apiResponse.message);
      }

      return apiResponse.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while updating collection');
    }
  }

  async bulkUploadCollections(collectionsData: CreateCollectionRequest[]): Promise<{
    createdCollections: any[];
    errors: string[];
    message: string;
    successCount: number;
    errorCount: number;
  }> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.BASE_URL}/collections/bulk`, {
        method: 'POST',
        body: JSON.stringify(collectionsData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiResponse<{
        createdCollections: any[];
        errors: string[];
        message: string;
      }> = await response.json();

      if (apiResponse.error) {
        throw new Error(apiResponse.message);
      }

      return {
        createdCollections: apiResponse.data.createdCollections,
        errors: apiResponse.data.errors,
        message: apiResponse.data.message,
        successCount: apiResponse.data.createdCollections.length,
        errorCount: apiResponse.data.errors.length,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while bulk uploading collections');
    }
  }

  async addSerialNumber(collectionId: number, serialNumberData: {
    sr_no: string;
    min_stock: number;
    max_stock: number;
    current_stock: number;
    unit: 'mtr' | 'pcs';
  }): Promise<CollectionSerialNumber> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.BASE_URL}/collections/${collectionId}/serial_numbers`, {
        method: 'POST',
        body: JSON.stringify(serialNumberData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiResponse<CollectionSerialNumber> = await response.json();

      if (apiResponse.error) {
        throw new Error(apiResponse.message);
      }

      return apiResponse.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while adding serial number');
    }
  }

  async updateSerialNumberStock(serialNumberId: number, stockData: {
    action: 'IN';
    quantity: number;
    reason: string;
  }): Promise<CollectionSerialNumber> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.BASE_URL}/collections/serial_numbers/${serialNumberId}`, {
        method: 'PUT',
        body: JSON.stringify(stockData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiResponse<CollectionSerialNumber> = await response.json();

      if (apiResponse.error) {
        throw new Error(apiResponse.message);
      }

      return apiResponse.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while updating serial number stock');
    }
  }

  async deleteSerialNumber(serialNumberId: number): Promise<boolean> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.BASE_URL}/collections/serial_numbers/${serialNumberId}`, {
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
      throw new Error('An unexpected error occurred while deleting serial number');
    }
  }
}

export const collectionService = new CollectionService();