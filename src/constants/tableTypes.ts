export const VENDOR_TYPES = {
  FREIGHT: "FREIGHT",
  SUPPLIER: "SUPPLIER",
} as const;

export const LEDGER_ACCOUNT_REFERENCE_TYPES = {
  CUSTOMER: "CUSTOMER",
  VENDOR: "VENDOR",
};

export const TRANSACTION_REFERENCE_TYPES = {
  SIPL: "SIPL",
  PAYMENT: "PAYMENT",
  SALES_ORDER: "SALES_ORDER",
};

export const TRANSACTION_TYPES = {
  DR: "dr",
  CR: "cr",
};

export const CUSTOMER_ADDRESS_TYPES = {
  SHIPPING: "SHIPPING",
  BILLING: "BILLING",
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
