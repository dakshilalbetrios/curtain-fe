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
  serial_numbers: CollectionSrNo[];
}

export interface CollectionSrNo {
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

export interface Order {
  id: number;
  status: 'PENDING' | 'APPROVED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  created_by: number;
  created_at: string;
  updated_by: number | null;
  updated_at: string | null;
  creator: any;
  updater: any;
  order_items: OrderItem[];
}

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

export interface CartItem {
  collection_sr_no_id: number;
  sr_no: string;
  collection_name: string;
  quantity: number;
  unit: string;
  available_stock: number;
}

// Re-export API types for convenience
export type { AuthUser as User } from '../services';