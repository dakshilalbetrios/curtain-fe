// Application constants
export const ORDER_DELIVERED_DAY = 4; // Days after which an order is considered overdue

// User Role constants
export const USER_ROLE = {
    ADMIN: 'ADMIN',
    SALES: 'SALES',
    CUSTOMER: 'CUSTOMER'
} as const;

export type UserRole = typeof USER_ROLE[keyof typeof USER_ROLE];

// User Status constants
export const USER_STATUS = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE'
} as const;

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];

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

// Collection Access Status constants
export const COLLECTION_ACCESS_STATUS = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE'
} as const;

export type CollectionAccessStatus = typeof COLLECTION_ACCESS_STATUS[keyof typeof COLLECTION_ACCESS_STATUS];

// Role display labels
export const ROLE_LABELS = {
    [USER_ROLE.ADMIN]: 'Administrator',
    [USER_ROLE.SALES]: 'Sales',
    [USER_ROLE.CUSTOMER]: 'Customer'
} as const;

// Status display labels
export const STATUS_LABELS = {
    [USER_STATUS.ACTIVE]: 'Active',
    [USER_STATUS.INACTIVE]: 'Inactive',
    [ORDER_STATUS.PENDING]: 'Pending',
    [ORDER_STATUS.APPROVED]: 'Approved',
    [ORDER_STATUS.SHIPPED]: 'Shipped',
    [ORDER_STATUS.DELIVERED]: 'Delivered',
    [ORDER_STATUS.CANCELLED]: 'Cancelled',
    [ORDER_STATUS.OVER_DUE]: 'Over Due'
} as const;

// Status colors for UI
export const STATUS_COLORS = {
    [USER_STATUS.ACTIVE]: 'green',
    [USER_STATUS.INACTIVE]: 'red',
    [ORDER_STATUS.PENDING]: 'orange',
    [ORDER_STATUS.APPROVED]: 'green',
    [ORDER_STATUS.SHIPPED]: 'blue',
    [ORDER_STATUS.DELIVERED]: 'purple',
    [ORDER_STATUS.CANCELLED]: 'red',
    [ORDER_STATUS.OVER_DUE]: 'red'
} as const;

// Role colors for UI
export const ROLE_COLORS = {
    [USER_ROLE.ADMIN]: 'green',
    [USER_ROLE.SALES]: 'blue',
    [USER_ROLE.CUSTOMER]: 'purple'
} as const;
