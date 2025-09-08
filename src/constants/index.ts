// Application constants
export const ORDER_DELIVERED_DAY = 4; // Days after which an order is considered overdue

// Order status constants
export const ORDER_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    SHIPPED: 'SHIPPED',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED',
    OVER_DUE: 'OVER_DUE'
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];
