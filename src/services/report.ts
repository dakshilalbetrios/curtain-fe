import { BaseService, ApiResponse } from "./types";

export interface ReportRequest {
    type: "most_ordered_serial_numbers" | "customer_collection_orders" | "customer_order_summary" | "collection_performance";
    format: "csv";
    startDate: string;
    endDate: string;
}

export interface ReportResponse {
    id: string;
    status: "generating" | "ready" | "error";
    downloadUrl?: string;
    generatedAt?: string;
    error?: string;
}

export interface MostOrderedSerialNumbersReport {
    serialNumber: string;
    collectionName: string;
    totalOrders: number;
    totalQuantity: number;
    revenue: number;
    averageOrderValue: number;
}

export interface CustomerCollectionOrdersReport {
    customerId: string;
    customerName: string;
    collectionName: string;
    totalOrders: number;
    totalAmount: number;
    orderDates: string[];
    accessLevel: string;
}

export interface CustomerOrderSummaryReport {
    customerId: string;
    customerName: string;
    totalOrders: number;
    totalAmount: number;
    averageOrderValue: number;
    lastOrderDate: string;
    status: string;
}

export interface CollectionPerformanceReport {
    collectionId: string;
    collectionName: string;
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    topSerialNumbers: string[];
    performance: string;
}

export class ReportService extends BaseService {
    // Download CSV report directly
    async downloadCSVReport(type: string, startDate: string, endDate: string): Promise<Blob> {
        try {
            let endpoint = "";

            switch (type) {
                case "most_ordered_serial_numbers":
                    endpoint = `/reports/most-ordered-serial-numbers/download/csv`;
                    break;
                case "customer_collection_orders":
                    endpoint = `/reports/customer-collection-orders/download/csv`;
                    break;
                case "customer_order_summary":
                    endpoint = `/reports/customer-order-summary/download/csv`;
                    break;
                case "collection_performance":
                    endpoint = `/reports/collection-performance/download/csv`;
                    break;
                default:
                    throw new Error(`Unknown report type: ${type}`);
            }

            const response = await this.makeAuthenticatedRequest(
                `${this.BASE_URL}${endpoint}?startDate=${startDate}&endDate=${endDate}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.blob();
        } catch (error) {
            console.error("Failed to download CSV report:", error);
            throw error;
        }
    }

    // Get most ordered serial numbers data
    async getMostOrderedSerialNumbers(
        startDate: string,
        endDate: string
    ): Promise<MostOrderedSerialNumbersReport[]> {
        try {
            const response = await this.makeAuthenticatedRequest(
                `${this.BASE_URL}/reports/most-ordered-serial-numbers?startDate=${startDate}&endDate=${endDate}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ApiResponse<MostOrderedSerialNumbersReport[]> = await response.json();
            return data.data;
        } catch (error) {
            console.error("Failed to get most ordered serial numbers:", error);
            throw error;
        }
    }

    // Get customer collection orders data
    async getCustomerCollectionOrders(
        startDate: string,
        endDate: string
    ): Promise<CustomerCollectionOrdersReport[]> {
        try {
            const response = await this.makeAuthenticatedRequest(
                `${this.BASE_URL}/reports/customer-collection-orders?startDate=${startDate}&endDate=${endDate}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ApiResponse<CustomerCollectionOrdersReport[]> = await response.json();
            return data.data;
        } catch (error) {
            console.error("Failed to get customer collection orders:", error);
            throw error;
        }
    }

    // Get customer order summary data
    async getCustomerOrderSummary(
        startDate: string,
        endDate: string
    ): Promise<CustomerOrderSummaryReport[]> {
        try {
            const response = await this.makeAuthenticatedRequest(
                `${this.BASE_URL}/reports/customer-order-summary?startDate=${startDate}&endDate=${endDate}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ApiResponse<CustomerOrderSummaryReport[]> = await response.json();
            return data.data;
        } catch (error) {
            console.error("Failed to get customer order summary:", error);
            throw error;
        }
    }

    // Get collection performance data
    async getCollectionPerformance(
        startDate: string,
        endDate: string
    ): Promise<CollectionPerformanceReport[]> {
        try {
            const response = await this.makeAuthenticatedRequest(
                `${this.BASE_URL}/reports/collection-performance?startDate=${startDate}&endDate=${endDate}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ApiResponse<CollectionPerformanceReport[]> = await response.json();
            return data.data;
        } catch (error) {
            console.error("Failed to get collection performance:", error);
            throw error;
        }
    }
}

// Export singleton instance
export const reportService = new ReportService();
