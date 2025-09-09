// Import all services for local use
import { authService, type AuthUser, type LoginRequest, type LoginResponse } from './auth';
import { userService, type UserResponse, type CreateRetailerRequest, type UpdateProfileRequest } from './user';
import { collectionService, type CollectionResponse, type CollectionSerialNumber, type CreateCollectionRequest, type UpdateCollectionRequest, type UpdateStockRequest } from './collection';
import { type ApiResponse } from './types';
import { orderService, type OrderResponse, type OrderItem, type CreateOrderRequest, type UpdateOrderStatusRequest } from './order';
import { reportService, type ReportRequest, type ReportResponse, type MostOrderedSerialNumbersReport, type CustomerCollectionOrdersReport, type CustomerOrderSummaryReport, type CollectionPerformanceReport } from './report';

// Re-export services
export { authService, userService, collectionService, orderService, reportService };

// Re-export types
export type {
  AuthUser,
  LoginRequest,
  LoginResponse,
  UserResponse,
  CreateRetailerRequest,
  UpdateProfileRequest,
  CollectionResponse,
  CollectionSerialNumber,
  CreateCollectionRequest,
  UpdateCollectionRequest,
  UpdateStockRequest,
  OrderResponse,
  OrderItem,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  ReportRequest,
  ReportResponse,
  MostOrderedSerialNumbersReport,
  CustomerCollectionOrdersReport,
  CustomerOrderSummaryReport,
  CollectionPerformanceReport,
  ApiResponse,
};

// Legacy compatibility - create a combined service for existing code
class LegacyApiService {
  // Auth methods
  login = authService.login.bind(authService);

  // User methods
  getAllUsers = userService.getAllUsers.bind(userService);
  addRetailer = userService.addRetailer.bind(userService);
  updateProfile = userService.updateProfile.bind(userService);
  changePassword = userService.changePassword.bind(userService);

  // Collection methods
  getAllCollections = collectionService.getAllCollections.bind(collectionService);
  getCollectionById = collectionService.getCollectionById.bind(collectionService);

  // Order methods
  getAllOrders = orderService.getAllOrders.bind(orderService);
  getOrderById = orderService.getOrderById.bind(orderService);
  createOrder = orderService.createOrder.bind(orderService);
  updateOrderStatus = orderService.updateOrderStatus.bind(orderService);
}

// Export legacy service for backward compatibility
export const apiService = new LegacyApiService();