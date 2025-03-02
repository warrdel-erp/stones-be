export const COA_TYPES = [
  { id: 1, name: "Assets", type: "Asset" },
  { id: 2, name: "Liabilities", type: "Liability" },
  { id: 3, name: "Equity", type: "Equity" },
  { id: 4, name: "Revenue", type: "Revenue" },
  { id: 5, name: "Expenses", type: "Expense" },
] as const;

export const COA_HEADERS = [
  { id: 101, name: "Current Assets", parent_id: 1 },
  { id: 102, name: "Fixed Assets", parent_id: 1 },
  { id: 201, name: "Current Liabilities", parent_id: 2 },
  { id: 202, name: "Long-term Liabilities", parent_id: 2 },
  { id: 301, name: "Retained Earnings", parent_id: 3 },
  { id: 302, name: "Share Capital", parent_id: 3 },
  { id: 401, name: "Sales Revenue", parent_id: 4 },
  { id: 402, name: "Other Revenue", parent_id: 4 },
  { id: 501, name: "Operating Expenses", parent_id: 5 },
  { id: 502, name: "Non-Operating Expenses", parent_id: 5 },
] as const;

export const COA_SUB_HEADERS = [
  { id: 1001, name: "Cash", subheader_id: 101 },
  { id: 1002, name: "Accounts Receivable", subheader_id: 101 },
  { id: 1003, name: "Inventory", subheader_id: 101 },

  { id: 1004, name: "Property, Plant & Equipment", subheader_id: 102 },
  { id: 1005, name: "Accumulated Depreciation", subheader_id: 102 },

  { id: 2001, name: "Accounts Payable", subheader_id: 201 },
  { id: 2002, name: "Short-term Loans", subheader_id: 201 },

  { id: 2003, name: "Long-term Loans", subheader_id: 202 },
  { id: 3001, name: "Retained Earnings", subheader_id: 301 },

  { id: 3002, name: "Common Stock", subheader_id: 302 },

  { id: 4001, name: "Product Sales", subheader_id: 401 },
  { id: 4002, name: "Service Revenue", subheader_id: 401 },

  { id: 4003, name: "Interest Income", subheader_id: 402 },

  { id: 5001, name: "Salaries & Wages", subheader_id: 501 },
  { id: 5002, name: "Rent Expense", subheader_id: 501 },
  { id: 5003, name: "Utilities", subheader_id: 501 },

  { id: 5004, name: "Depreciation", subheader_id: 502 },
  { id: 5005, name: "Interest Expense", subheader_id: 502 },
] as const;

export const LEDGER_ACCOUNT_TYPES = {
  CREDIT: "CREDIT ",
  DEBIT: "DEBIT",
} as const;
