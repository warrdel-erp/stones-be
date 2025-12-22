export const PERMISSIONS = {
    SERVICES: {
        value: "perm_8f3a1d9c",
    },
    CUSTOMER: {
        value: "perm_2b7e4g6h",
    },
    SUPPLIER: {
        value: "perm_9x5j2k8l",
    },
    VENDOR: {
        value: "perm_1m6n3p0q",
    },
    PRODUCTS: {
        value: "perm_4r8s5t2u",
    },
    RETURNS: {
        value: "perm_7v9w3x1y",
    },
    SELECTION_SHEET: {
        value: "perm_5z2a6b4c",
    },
    DELIVERIES: {
        value: "perm_0d8e1f3g",
    },
    SALES: {
        value: "perm_6h5i9j2k",
    },
    PURCHASE: {
        value: "perm_3l7m4n8p",
    },
    PERMISSION_MANAGEMENT: {
        value: "perm_9k2j5h1g",
    },
    USERS: {
        value: "perm_a1b2c3d4",
    },
    TRUCKS: {
        value: "perm_5t7u9v1w",
    },
    CREDIT_DEBIT_NOTE: {
        value: "perm_3d5f7g9h",
    },
    TRANSACTIONS: {
        value: "perm_2a4s6d8f",
    },
    CHART_OF_ACCOUNTS: {
        value: "perm_1q3w5e7r",
    },
    BALANCE_SHEET: {
        value: "perm_0z9x8c7v",
    },
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
export type PermissionValue = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]['value'];
