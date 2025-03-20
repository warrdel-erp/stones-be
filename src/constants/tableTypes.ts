import { SIPL } from "../models";

export const VENDOR_TYPES = {
  FREIGHT: "FREIGHT",
  SUPPLIER: "SUPPLIER",
} as const;

export const LEDGER_ACCOUNT_REFERENCE_TYPES = {
  CUSTOMER: "CUSTOMER",
  VENDOR: "VENDOR",
};

export const JOURNAL_ENTRY_REFERENCE_TYPES = {
  SIPL: "SIPL",
  PAYMENT: "PAYMENT",
  SALES_ORDER: "SALES_ORDER",
};

export const JOURNAL_ENTRY_PROCESS_TYPE = {
  CREATE_SIPL: "create_sipl",
  ADD_FREIGHT_BILL: "add_freight_bill",
  RECEIVE_INVENTORY: "receive_inventory",
};

export const JOURNAL_ENTRY_TYPE = {
  DR: "dr",
  CR: "cr",
};

export const CUSTOMER_ADDRESS_TYPES = {
  SHIPPING: "SHIPPING",
  BILLING: "REMIT",
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
