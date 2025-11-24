import { SIPL } from "../models";

export const VENDOR_TYPES = {
  FREIGHT: "FREIGHT",
  SUPPLIER: "SUPPLIER",
} as const;

export const LEDGER_ACCOUNT_REFERENCE_TYPES = {
  CUSTOMER: "CUSTOMER",
  VENDOR: "VENDOR",
} as const;

export const JOURNAL_ENTRY_REFERENCE_TYPES = {
  SIPL: "SIPL",
  BILL: "BILL",
  LOADING_ORDER: "LOADING_ORDER",
  LOADING_ORDER_INVOICE: "LOADING_ORDER_INVOICE",
  SALES_ORDER: "SALES_ORDER",
  RETURN: "RETURN",
  ADVANCE_DEPOSIT: "ADVANCE_DEPOSIT",
} as const;

export const JOURNAL_ENTRY_FOR_TYPES = {
  SIPL: "SIPL",
  LOADING_ORDER: "LOADING_ORDER",
  RETURN: "RETURN"
} as const;

export const JOURNAL_ENTRY_SUB_REFERENCE_TYPES = {
  SIPL_PRODUCT: "sipl_product",
  PRODUCT: "product",
  SLAB: "slab",
  BILL_ITEM: "bill_item",
  BILL: "bill",
  LOADING_ORDER: "loading_order",
  TRADE_SERVICE: "trade_service",
} as const;

export const JOURNAL_ENTRY_PROCESS_TYPE = {
  CREATE_SIPL: "create_sipl",
  ADD_FREIGHT_BILL: "add_freight_bill",
  RECEIVE_INVENTORY: "receive_inventory",
  SIPL_PAYMENT: "sipl_payment",
  BILL_PAYMENT: "bill_payment",
  SO_INVOICING: "so_invoicing",
  SO_INVOICE_PAYMENT: "so_invoice_payment",
  CONFIRM_RETURN: "confirm_return",
  ADVANCE_DEPOSIT: "advance_deposit",
  CUSTOM: "custom",
} as const;

export const JOURNAL_ENTRY_TYPE = {
  DR: "dr",
  CR: "cr",
} as const;

export const CUSTOMER_ADDRESS_TYPES = {
  SHIPPING: "SHIPPING",
  REMIT: "REMIT",
} as const;

export const PAYMENT_METHOD = {
  CREDIT_CARD: "creditCard",
  BANK_TRANSFER: "bankTransfer",
  CASH: "cash",
  CHEQUE: "cheque",
} as const;

export const PAYMENT_STATUS = {
  PENDING: "pending",
  COMPLETE: "completed",
  FAILED: "failed",
} as const;

export const PAYEE_TYPE = {
  CUSTOMER: "customer",
  VENDOR: "vendor",
} as const;

export const PAYMENT_TYPE = {
  INCOMING: "incoming",
  OUTGOING: "outgoing",
} as const;

export const BILL_REFERENCE_TYPES = {
  SIPL: "sipl",
} as const;

export const SLAB_ENTRY_UNIT = {
  METER: "meter",
  FEET: "feet",
  IN: "in",
} as const;

export const PO_STATUS = {
  OPEN: "open",
  CLOSED: "closed",
  CANCELED: "canceled",
};

export const PAYMENT_BILL_REFERENCE_TYPES = {
  SIPL: "sipl",
  BILL: "bill",
  SO_INVOICE: "soInvoice",
  ADVANCED_DEPOSIT: "advancedDeposit",
} as const;

export const DELIVERY_TYPES = {
  PICKUP: "pickup",
  DELIVERY: "delivery",
} as const;

export const LOADING_ORDER_STAGES = {
  INITIATED: "initiated",
  PACKAGING_LIST: "packagingList",
  INVOICED: "invoiced",
} as const;

export const SALE_ORDER_PRODUCT_STAGES = {
  SALES_ORDER: "saleOrder",
  LOADING_ORDER: "loadingOrder",
  PACKAGING_LIST: "packagingList",
  INVOICED: "invoiced",
} as const;

export const SALES_ORDER_STATUS = {
  OPEN: "open",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  CLOSED: "closed",
} as const;

// "internal", "printable"
export const NOTES_TYPE = {
  INTERNAL: "internal",
  PRINTABLE: "printable",
  DELIVERY: "delivery",
} as const;

// sales_order, purchase_order
export const NOTES_REFERENCE_TYPES = {
  SALES_ORDER: "sales_order",
  PURCHASE_ORDER: "purchase_order",
  LOADING_ORDER: "loading_order",
} as const;

export const VEHICLE_TYPE = {
  LIGHT: "light",
  MEDIUM: "medium",
  HEAVY: "heavy",
} as const;

export const CUSTOMER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export const DELIVERY_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  COMPLETED: "completed",
} as const;

export const CREDIT_NOTE_REFERENCE_TYPES = {
  PAYMENT: "payment",
} as const;

export const CREDIT_DEBIT_NOTE_ENTRY_FOR_TYPES = {
  CUSTOMER: "customer",
  VENDOR: "vendor",
} as const;


export const CREDIT_DEBIT_NOTE_TYPES = {
  CREDIT: "credit",
  DEBIT: "debit",
} as const;
