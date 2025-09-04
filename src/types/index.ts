export interface User {
  id: number;
  name: string;
  mobile_no: string;
  shop_name: string;
  role: 'ADMIN' | 'SALES' | 'CUSTOMER';
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
}

export interface Collection {
  id: number;
  name: string;
  description: string;
  created_at: string;
  serial_numbers?: CollectionSrNo[];
}

export interface CollectionSrNo {
  id: number;
  collection_id: number;
  sr_no: string;
  min_stock: number;
  max_stock: number;
  current_stock: number;
  unit: 'mtr' | 'pcs';
  created_at: string;
}

export interface Order {
  id: number;
  status: 'PENDING' | 'APPROVED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  created_at: string;
  items: OrderItem[];
  total_quantity?: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  collection_sr_no_id: number;
  quantity: number;
  collection_sr_no?: CollectionSrNo;
  collection?: Collection;
}

export interface CartItem {
  collection_sr_no_id: number;
  sr_no: string;
  collection_name: string;
  quantity: number;
  unit: string;
  available_stock: number;
}

export interface CustomerCollectionAccess {
  id: number;
  customer_user_id: number;
  collection_id: number;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED' | 'EXPIRED';
  created_at: string;
}