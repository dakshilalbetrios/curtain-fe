import { User, Collection, CollectionSrNo, Order, OrderItem } from '../types';

export const mockUsers: User[] = [
  {
    id: 1,
    name: 'Admin User',
    mobile_no: '9876543210',
    shop_name: 'Head Office',
    role: 'ADMIN',
    status: 'ACTIVE',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Vaghani Daxil',
    mobile_no: '9876543211',
    shop_name: 'Curtain Palace',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    created_at: '2024-01-02T00:00:00Z'
  },
  {
    id: 3,
    name: 'Rajesh Shah',
    mobile_no: '9876543212',
    shop_name: 'Home Decor Plus',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    created_at: '2024-01-03T00:00:00Z'
  },
  {
    id: 4,
    name: 'Sales Manager',
    mobile_no: '9876543213',
    shop_name: 'Sales Branch 1',
    role: 'SALES',
    status: 'ACTIVE',
    created_at: '2024-01-04T00:00:00Z'
  }
];

export const mockCollectionSrNos: CollectionSrNo[] = [
  {
    id: 1,
    collection_id: 1,
    sr_no: 'PC001',
    min_stock: 10,
    max_stock: 100,
    current_stock: 25,
    unit: 'mtr',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    collection_id: 1,
    sr_no: 'PC002',
    min_stock: 5,
    max_stock: 50,
    current_stock: 8,
    unit: 'mtr',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 3,
    collection_id: 2,
    sr_no: 'OB001',
    min_stock: 15,
    max_stock: 80,
    current_stock: 45,
    unit: 'pcs',
    created_at: '2024-01-02T00:00:00Z'
  },
  {
    id: 4,
    collection_id: 2,
    sr_no: 'OB002',
    min_stock: 10,
    max_stock: 60,
    current_stock: 32,
    unit: 'pcs',
    created_at: '2024-01-02T00:00:00Z'
  },
  {
    id: 5,
    collection_id: 3,
    sr_no: 'BC001',
    min_stock: 8,
    max_stock: 40,
    current_stock: 5,
    unit: 'mtr',
    created_at: '2024-01-03T00:00:00Z'
  }
];

export const mockCollections: Collection[] = [
  {
    id: 1,
    name: 'Premium Curtains',
    description: 'High-quality curtain collection with elegant designs',
    created_at: '2024-01-01T00:00:00Z',
    serial_numbers: mockCollectionSrNos.filter(sr => sr.collection_id === 1)
  },
  {
    id: 2,
    name: 'Office Blinds',
    description: 'Professional office window treatments',
    created_at: '2024-01-02T00:00:00Z',
    serial_numbers: mockCollectionSrNos.filter(sr => sr.collection_id === 2)
  },
  {
    id: 3,
    name: 'Bathroom Curtains',
    description: 'Water-resistant bathroom window coverings',
    created_at: '2024-01-03T00:00:00Z',
    serial_numbers: mockCollectionSrNos.filter(sr => sr.collection_id === 3)
  },
  {
    id: 4,
    name: 'Kids Room Curtains',
    description: 'Colorful and fun children room curtains',
    created_at: '2024-01-04T00:00:00Z',
    serial_numbers: []
  },
  {
    id: 5,
    name: 'Living Room Drapes',
    description: 'Elegant living room window treatments',
    created_at: '2024-01-05T00:00:00Z',
    serial_numbers: []
  }
];

export const mockOrderItems: OrderItem[] = [
  {
    id: 1,
    order_id: 1,
    collection_sr_no_id: 1,
    quantity: 4.5,
    collection_sr_no: mockCollectionSrNos[0],
    collection: mockCollections[0]
  },
  {
    id: 2,
    order_id: 1,
    collection_sr_no_id: 3,
    quantity: 2.0,
    collection_sr_no: mockCollectionSrNos[2],
    collection: mockCollections[1]
  },
  {
    id: 3,
    order_id: 2,
    collection_sr_no_id: 2,
    quantity: 3.0,
    collection_sr_no: mockCollectionSrNos[1],
    collection: mockCollections[0]
  },
  {
    id: 4,
    order_id: 3,
    collection_sr_no_id: 4,
    quantity: 5.0,
    collection_sr_no: mockCollectionSrNos[3],
    collection: mockCollections[1]
  }
];

export const mockOrders: Order[] = [
  {
    id: 1,
    status: 'DELIVERED',
    created_at: '2024-07-15T00:00:00Z',
    items: mockOrderItems.filter(item => item.order_id === 1),
    total_quantity: 6.5
  },
  {
    id: 2,
    status: 'SHIPPED',
    created_at: '2024-08-20T00:00:00Z',
    items: mockOrderItems.filter(item => item.order_id === 2),
    total_quantity: 3.0
  },
  {
    id: 3,
    status: 'APPROVED',
    created_at: '2024-12-25T00:00:00Z',
    items: mockOrderItems.filter(item => item.order_id === 3),
    total_quantity: 5.0
  },
  {
    id: 4,
    status: 'PENDING',
    created_at: '2024-12-28T00:00:00Z',
    items: [],
    total_quantity: 0
  },
  {
    id: 5,
    status: 'CANCELLED',
    created_at: '2024-11-05T00:00:00Z',
    items: [],
    total_quantity: 0
  },
  {
    id: 6,
    status: 'PENDING',
    created_at: '2024-12-26T00:00:00Z',
    items: [],
    total_quantity: 2.5
  }
];

// Additional orders for better demo
export const additionalOrders: Order[] = [
  {
    id: 123456,
    status: 'PENDING',
    created_at: '2024-01-15T00:00:00Z',
    items: [],
    total_quantity: 0
  },
  {
    id: 789012,
    status: 'APPROVED',
    created_at: '2024-02-20T00:00:00Z',
    items: [],
    total_quantity: 0
  },
  {
    id: 345678,
    status: 'SHIPPED',
    created_at: '2024-03-25T00:00:00Z',
    items: [],
    total_quantity: 0
  },
  {
    id: 901234,
    status: 'DELIVERED',
    created_at: '2024-04-30T00:00:00Z',
    items: [],
    total_quantity: 0
  },
  {
    id: 567890,
    status: 'CANCELLED',
    created_at: '2024-05-05T00:00:00Z',
    items: [],
    total_quantity: 0
  },
  {
    id: 246810,
    status: 'SHIPPED',
    created_at: '2024-06-10T00:00:00Z',
    items: [],
    total_quantity: 0
  },
  {
    id: 135792,
    status: 'DELIVERED',
    created_at: '2024-07-15T00:00:00Z',
    items: [],
    total_quantity: 0
  },
  {
    id: 975310,
    status: 'PENDING',
    created_at: '2024-08-20T00:00:00Z',
    items: [],
    total_quantity: 0
  }
];

export const allOrders = [...mockOrders, ...additionalOrders];

export const chartData = [
  { month: 'Jan', orders: 12, revenue: 24000 },
  { month: 'Feb', orders: 19, revenue: 38000 },
  { month: 'Mar', orders: 15, revenue: 30000 },
  { month: 'Apr', orders: 25, revenue: 50000 },
  { month: 'May', orders: 18, revenue: 36000 },
  { month: 'Jun', orders: 22, revenue: 44000 },
  { month: 'Jul', orders: 28, revenue: 56000 },
  { month: 'Aug', orders: 30, revenue: 60000 },
  { month: 'Sep', orders: 20, revenue: 40000 },
  { month: 'Oct', orders: 24, revenue: 48000 },
  { month: 'Nov', orders: 26, revenue: 52000 },
  { month: 'Dec', orders: 32, revenue: 64000 }
];