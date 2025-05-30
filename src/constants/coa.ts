export const COA_TYPES = [
  {
    id: 1,
    number: "1",
    name: "Assets",
    key: "assets",
    code: 100000,
  },
  {
    id: 2,
    number: "2",
    name: "Liabilities",
    key: "liabilities",
    code: 200000,
  },
  {
    id: 3,
    number: "3",
    name: "Equity, Including Portion Attributable to Non controlling Interest",
    key: "equity_including_non_controlling_interest",
    code: 300000,
  },
  {
    id: 4,
    number: "4",
    name: "Revenue",
    key: "revenue",
    code: 400000,
  },
  {
    id: 5,
    number: "5",
    name: "Expenses",
    key: "expenses",
    code: 500000,
  },
  {
    id: 6,
    number: "6",
    name: "Other (Non-Operating) Income and Expenses",
    key: "other_non_operating_income_expenses",
    code: 600000,
  },
  {
    id: 7,
    number: "7",
    name: "Intercompany and Related Party Accounts",
    key: "intercompany_related_party_accounts",
    code: 700000,
  },
] as const;

export const COA_HEADERS = [
  {
    id: 1,
    number: "1.1",
    name: "Cash and Financial Assets",
    key: "cash_and_financial_assets",
    parent_id: 1,
    code: 110000,
  },
  {
    id: 2,
    number: "1.2",
    name: "Receivables and Contracts",
    key: "receivables_and_contracts",
    parent_id: 1,
    code: 120000,
  },
  {
    id: 3,
    number: "1.3",
    name: "Inventory",
    key: "inventory",
    parent_id: 1,
    code: 130000,
  },
  {
    id: 4,
    number: "1.4",
    name: "Accruals and Additional Assets",
    key: "accruals_and_additional_assets",
    parent_id: 1,
    code: 140000,
  },
  {
    id: 5,
    number: "1.5",
    name: "Property, Plant and Equipment, Net",
    key: "property_plant_and_equipment_net",
    parent_id: 1,
    code: 150000,
  },
  {
    id: 6,
    number: "1.6",
    name: "Intangible Assets (Excluding Goodwill)",
    key: "intangible_assets_excluding_goodwill",
    parent_id: 1,
    code: 160000,
  },
  {
    id: 7,
    number: "1.7",
    name: "Goodwill",
    key: "goodwill",
    parent_id: 1,
    code: 170000,
  },

  {
    id: 8,
    number: "2.1",
    name: "Payables",
    key: "payables",
    parent_id: 2,
    code: 210000,
  },
  {
    id: 9,
    number: "2.2",
    name: "Accruals, Deferrals and Additional Liabilities",
    key: "accruals_deferrals_and_additional_liabilities",
    parent_id: 2,
    code: 220000,
  },
  {
    id: 10,
    number: "2.3",
    name: "Financial Liabilities",
    key: "financial_liabilities",
    parent_id: 2,
    code: 230000,
  },
  {
    id: 11,
    number: "2.4",
    name: "Commitments and Contingencies",
    key: "commitments_and_contingencies",
    parent_id: 2,
    code: 240000,
  },

  {
    id: 12,
    number: "3.1",
    name: "Equity, Attributable to Parent",
    key: "equity_attributable_to_parent",
    parent_id: 3,
    code: 310000,
  },
  {
    id: 13,
    number: "3.2",
    name: "Retained Earnings (Accumulated Deficit)",
    key: "retained_earnings_accumulated_deficit",
    parent_id: 3,
    code: 320000,
  },
  {
    id: 14,
    number: "3.3",
    name: "Accumulated Other Comprehensive Income (Loss)",
    key: "accumulated_other_comprehensive_income_loss",
    parent_id: 3,
    code: 330000,
  },
  {
    id: 15,
    number: "3.4",
    name: "Other Equity Items",
    key: "other_equity_items",
    parent_id: 3,
    code: 340000,
  },
  {
    id: 16,
    number: "3.5",
    name: "Equity, Attributable to Non controlling Interest",
    key: "equity_attributable_to_non_controlling_interest",
    parent_id: 3,
    code: 350000,
  },

  {
    id: 17,
    number: "4.1",
    name: "Recognized Point of Time",
    key: "recognized_point_of_time",
    parent_id: 4,
    code: 410000,
  },
  {
    id: 18,
    number: "4.2",
    name: "Recognized Over Time",
    key: "recognized_over_time",
    parent_id: 4,
    code: 420000,
  },
  {
    id: 19,
    number: "4.3",
    name: "Adjustments",
    key: "adjustments",
    parent_id: 4,
    code: 430000,
  },

  {
    id: 20,
    number: "5.1",
    name: "Expenses (Classified by Nature)",
    key: "expenses_classified_by_nature",
    parent_id: 5,
    code: 510000,
  },
  {
    id: 21,
    number: "5.2",
    name: "Expenses (Classified by Function)",
    key: "expenses_classified_by_function",
    parent_id: 5,
    code: 520000,
  },
  {
    id: 22,
    number: "5.3",
    name: "Operational Expense",
    key: "operational_expense",
    parent_id: 5,
    code: 530000,
  },

  {
    id: 23,
    number: "6.1",
    name: "Other Revenue and Expenses",
    key: "other_revenue_and_expenses",
    parent_id: 6,
    code: 610000,
  },
  {
    id: 24,
    number: "6.2",
    name: "Gains and Losses",
    key: "gains_and_losses",
    parent_id: 6,
    code: 620000,
  },
  {
    id: 25,
    number: "6.3",
    name: "Taxes (Other than Income and Payroll) and Fees",
    key: "taxes_other_than_income_and_payroll_fees",
    parent_id: 6,
    code: 630000,
  },
  {
    id: 26,
    number: "6.4",
    name: "Income Tax Expense (Benefit)",
    key: "income_tax_expense_benefit",
    parent_id: 6,
    code: 640000,
  },

  {
    id: 27,
    number: "7.1",
    name: "Intercompany and Related Party Assets",
    key: "intercompany_related_party_assets",
    parent_id: 7,
    code: 710000,
  },
  {
    id: 28,
    number: "7.2",
    name: "Intercompany and Related Party Liabilities",
    key: "intercompany_related_party_liabilities",
    parent_id: 7,
    code: 720000,
  },
  {
    id: 29,
    number: "7.3",
    name: "Intercompany and Related Party Income and Expense",
    key: "intercompany_related_party_income_expense",
    parent_id: 7,
    code: 730000,
  },
] as const;

export const COA_SUB_HEADERS = [
  {
    id: 1,
    number: "1.1.1",
    name: "Cash and Cash Equivalents",
    key: "cash_and_cash_equivalents",
    parent_id: 1,
    code: 111000,
    type: "Dr"
  },
  {
    id: 2,
    number: "1.1.2",
    name: "Investments",
    key: "investments",
    parent_id: 1,
    code: 112000,
    type: "Dr"
  },
  {
    id: 3,
    number: "1.2.1",
    name: "Accounts, Notes and Loans Receivable",
    key: "accounts_notes_loans_receivable",
    parent_id: 2,
    code: 121000,
    type: "Dr"
  },
  {
    id: 4,
    number: "1.2.2",
    name: "Contracts with Customers",
    key: "contracts_with_customers",
    parent_id: 2,
    code: 122000,
    type: "Dr"
  },
  {
    id: 5,
    number: "1.2.3",
    name: "Nontrade and Other Receivables",
    key: "nontrade_and_other_receivables",
    parent_id: 2,
    code: 123000,
    type: "Dr"
  },
  {
    id: 6,
    number: "1.3.1",
    name: "In Transit",
    key: "in_transit",
    parent_id: 3,
    code: 131000,
    type: "Dr"
  },
  {
    id: 7,
    number: "1.3.2",
    name: "Merchandise",
    key: "merchandise",
    parent_id: 3,
    code: 132000,
    type: "Dr"
  },
  {
    id: 8,
    number: "1.3.3",
    name: "Raw Material, Parts and Supplies",
    key: "raw_material_parts_and_supplies",
    parent_id: 3,
    code: 133000,
    type: "Dr"
  },
  {
    id: 9,
    number: "1.3.4",
    name: "Work in Process",
    key: "work_in_process",
    parent_id: 3,
    code: 134000,
    type: "Dr"
  },
  {
    id: 10,
    number: "1.3.5",
    name: "Other Inventory, Gross",
    key: "other_inventory_gross",
    parent_id: 3,
    code: 135000,
    type: "Dr"
  },
  {
    id: 11,
    number: "1.4.1",
    name: "Prepaid Expense",
    key: "prepaid_expense",
    parent_id: 4,
    code: 141000,
    type: "Dr"
  },
  {
    id: 12,
    number: "1.4.2",
    name: "Accrued Income",
    key: "accrued_income",
    parent_id: 4,
    code: 142000,
    type: "Dr"
  },
  {
    id: 13,
    number: "1.4.3",
    name: "Service Provider Work in Process",
    key: "service_provider_work_in_process",
    parent_id: 4,
    code: 143000,
    type: "Dr"
  },
  {
    id: 14,
    number: "1.4.4",
    name: "Additional Assets",
    key: "additional_assets",
    parent_id: 4,
    code: 144000,
    type: "Dr"
  },
  {
    id: 15,
    number: "1.5.1",
    name: "Land and Land Improvements",
    key: "land_and_land_improvements",
    parent_id: 5,
    code: 151000,
    type: "Dr"
  },
  {
    id: 16,
    number: "1.5.2",
    name: "Buildings, Structures and Improvements",
    key: "buildings_structures_and_improvements",
    parent_id: 5,
    code: 152000,
    type: "Dr"
  },
  {
    id: 17,
    number: "1.5.3",
    name: "Machinery and Equipment",
    key: "machinery_and_equipment",
    parent_id: 5,
    code: 153000,
    type: "Dr"
  },
  {
    id: 18,
    number: "1.5.4",
    name: "Furniture and Fixtures",
    key: "furniture_and_fixtures",
    parent_id: 5,
    code: 154000,
    type: "Dr"
  },
  {
    id: 19,
    number: "1.5.5",
    name: "Right of Use Assets (Classified as PP&E)",
    key: "right_of_use_assets_ppe",
    parent_id: 5,
    code: 155000,
    type: "Dr"
  },
  {
    id: 20,
    number: "1.5.6",
    name: "Additional Property, Plant and Equipment",
    key: "additional_property_plant_equipment",
    parent_id: 5,
    code: 156000,
    type: "Dr"
  },
  {
    id: 21,
    number: "1.5.7",
    name: "Construction in Progress",
    key: "construction_in_progress",
    parent_id: 5,
    code: 157000,
    type: "Dr"
  },
  {
    id: 22,
    number: "1.6.1",
    name: "Intellectual Property",
    key: "intellectual_property",
    parent_id: 6,
    code: 161000,
    type: "Dr"
  },
  {
    id: 23,
    number: "1.6.2",
    name: "Computer Software",
    key: "computer_software",
    parent_id: 6,
    code: 162000,
    type: "Dr"
  },
  {
    id: 24,
    number: "1.6.3",
    name: "Trade and Distribution Assets",
    key: "trade_and_distribution_assets",
    parent_id: 6,
    code: 163000,
    type: "Dr"
  },
  {
    id: 25,
    number: "1.6.4",
    name: "Contracts and Rights",
    key: "contracts_and_rights",
    parent_id: 6,
    code: 164000,
    type: "Dr"
  },
  {
    id: 26,
    number: "1.6.5",
    name: "Right of Use Assets (Classified as Intangible)",
    key: "right_of_use_assets_intangible",
    parent_id: 6,
    code: 165000,
    type: "Dr"
  },
  {
    id: 27,
    number: "1.6.6",
    name: "Crypto Assets (Classified as Intangible)",
    key: "crypto_assets_intangible",
    parent_id: 6,
    code: 166000,
    type: "Dr"
  },
  {
    id: 28,
    number: "1.6.7",
    name: "Additional Intangible Assets",
    key: "additional_intangible_assets",
    parent_id: 6,
    code: 167000,
    type: "Dr"
  },
  {
    id: 29,
    number: "1.6.8",
    name: "Acquisition in Progress",
    key: "acquisition_in_progress",
    parent_id: 6,
    code: 168000,
    type: "Dr"
  },
  {
    id: 30,
    number: "2.1.1",
    name: "Trade Payables",
    key: "trade_payables",
    parent_id: 8,
    code: 211000,
    type: "Cr"
  },
  {
    id: 31,
    number: "2.1.2",
    name: "Freight Payables",
    key: "freight_payables",
    parent_id: 8,
    code: 212000,
    type: "Cr"
  },
  {
    id: 32,
    number: "2.1.3",
    name: "Tax Payables",
    key: "tax_payables",
    parent_id: 8,
    code: 213000,
    type: "Cr"
  },
  {
    id: 33,
    number: "2.1.4",
    name: "Dividends Payable",
    key: "dividends_payable",
    parent_id: 8,
    code: 214000,
    type: "Cr"
  },
  {
    id: 34,
    number: "2.1.5",
    name: "Interest Payable",
    key: "interest_payable",
    parent_id: 8,
    code: 215000,
    type: "Cr"
  },
  {
    id: 35,
    number: "2.1.6",
    name: "Other Accounts Payable and Accrued Liabilities",
    key: "other_accounts_payable_accrued_liabilities",
    parent_id: 8,
    code: 216000,
    type: "Cr"
  },
  {
    id: 36,
    number: "2.2.1",
    name: "Accrued Expenses",
    key: "accrued_expenses",
    parent_id: 9,
    code: 221000,
    type: "Cr"
  },
  {
    id: 37,
    number: "2.2.2",
    name: "Accrued Taxes (Other than Payroll)",
    key: "accrued_taxes_other_than_payroll",
    parent_id: 9,
    code: 222000,
    type: "Cr"
  },
  {
    id: 38,
    number: "2.2.3",
    name: "Deferred Income and Refund Liabilities",
    key: "deferred_income_refund_liabilities",
    parent_id: 9,
    code: 223000,
    type: "Cr"
  },
  {
    id: 39,
    number: "2.2.4",
    name: "Additional Liabilities",
    key: "additional_liabilities",
    parent_id: 9,
    code: 224000,
    type: "Cr"
  },
  {
    id: 40,
    number: "2.3.1",
    name: "Notes Payable",
    key: "notes_payable",
    parent_id: 10,
    code: 231000,
    type: "Cr"
  },
  {
    id: 41,
    number: "2.3.2",
    name: "Loans Payable",
    key: "loans_payable",
    parent_id: 10,
    code: 232000,
    type: "Cr"
  },
  {
    id: 42,
    number: "2.3.3",
    name: "Bonds (Debentures)",
    key: "bonds_debentures",
    parent_id: 10,
    code: 233000,
    type: "Cr"
  },
  {
    id: 43,
    number: "2.3.4",
    name: "Other Debts and Borrowings",
    key: "other_debts_borrowings",
    parent_id: 10,
    code: 234000,
    type: "Cr"
  },
  {
    id: 44,
    number: "2.3.5",
    name: "Lease Obligations",
    key: "lease_obligations",
    parent_id: 10,
    code: 235000,
    type: "Cr"
  },
  {
    id: 45,
    number: "2.3.6",
    name: "Derivative Liability",
    key: "derivative_liability",
    parent_id: 10,
    code: 236000,
    type: "Cr"
  },
  {
    id: 46,
    number: "2.4.1",
    name: "Customer Related Contingencies",
    key: "customer_related_contingencies",
    parent_id: 11,
    code: 241000,
    type: "Cr"
  },
  {
    id: 47,
    number: "2.4.2",
    name: "Litigation and Regulatory",
    key: "litigation_regulatory",
    parent_id: 11,
    code: 242000,
    type: "Cr"
  },
  {
    id: 48,
    number: "2.4.3",
    name: "Additional Provisions",
    key: "additional_provisions",
    parent_id: 11,
    code: 243000,
    type: "Cr"
  },
  {
    id: 49,
    number: "3.1.1",
    name: "Equity at Par",
    key: "equity_at_par",
    parent_id: 12,
    code: 311000,
    type: "Cr"
  },
  {
    id: 50,
    number: "3.1.2",
    name: "Additional Paid in Capital",
    key: "additional_paid_in_capital",
    parent_id: 12,
    code: 312000,
    type: "Cr"
  },
  {
    id: 51,
    number: "3.2.1",
    name: "Retained Earnings, Appropriated",
    key: "retained_earnings_appropriated",
    parent_id: 13,
    code: 321000,
    type: "Cr"
  },
  {
    id: 52,
    number: "3.2.2",
    name: "Retained Earnings, Unappropriated",
    key: "retained_earnings_unappropriated",
    parent_id: 13,
    code: 322000,
    type: "Cr"
  },
  {
    id: 53,
    number: "3.2.3",
    name: "Deficit",
    key: "deficit",
    parent_id: 13,
    code: 323000,
    type: "Dr"
  },
  {
    id: 54,
    number: "3.2.4",
    name: "In Suspense",
    key: "in_suspense",
    parent_id: 13,
    code: 324000,
    type: "Cr"
  },
  {
    id: 55,
    number: "3.3.1",
    name: "Foreign Currency Translation Adjustment",
    key: "foreign_currency_translation_adjustment",
    parent_id: 14,
    code: 331000,
    type: null
  },
  {
    id: 56,
    number: "3.3.2",
    name: "AOCI, Cash Flow Hedge, Cumulative Gain (Loss)",
    key: "aoci_cash_flow_hedge_cumulative_gain_loss",
    parent_id: 14,
    code: 332000,
    type: null
  },
  {
    id: 57,
    number: "3.3.3",
    name: "Remeasurements Available-For-Sale Financial Assets",
    key: "remeasurements_available_for_sale_financial_assets",
    parent_id: 14,
    code: 333000,
    type: null
  },
  {
    id: 58,
    number: "3.3.4",
    name: "Remeasurement of Defined Benefit Plans",
    key: "remeasurement_of_defined_benefit_plans",
    parent_id: 14,
    code: 334000,
    type: null
  },
  {
    id: 59,
    number: "3.3.5",
    name: "Additional AOCI Items",
    key: "additional_aoci_items",
    parent_id: 14,
    code: 335000,
    type: null
  },
  {
    id: 60,
    number: "3.4.1",
    name: "ESOP Related Items",
    key: "esop_related_items",
    parent_id: 15,
    code: 341000,
    type: "Cr"
  },
  {
    id: 61,
    number: "3.4.2",
    name: "Stock Receivables",
    key: "stock_receivables",
    parent_id: 15,
    code: 342000,
    type: "Dr"
  },
  {
    id: 62,
    number: "3.4.3",
    name: "Treasury Stock",
    key: "treasury_stock",
    parent_id: 15,
    code: 343000,
    type: "Dr"
  },
  {
    id: 63,
    number: "3.4.4",
    name: "Additional Equity",
    key: "additional_equity",
    parent_id: 15,
    code: 344000,
    type: "Cr"
  },
  {
    id: 64,
    number: "4.1.1",
    name: "Goods",
    key: "goods",
    parent_id: 17,
    code: 411000,
    type: "Cr"
  },
  {
    id: 65,
    number: "4.1.2",
    name: "Services",
    key: "services_4_1",
    parent_id: 17,
    code: 412000,
    type: "Cr"
  },
  {
    id: 66,
    number: "4.2.1",
    name: "Products",
    key: "products",
    parent_id: 18,
    code: 421000,
    type: "Cr"
  },
  {
    id: 67,
    number: "4.2.2",
    name: "Services",
    key: "services_4_2",
    parent_id: 18,
    code: 422000,
    type: "Cr"
  },
  {
    id: 68,
    number: "4.3.1",
    name: "Variable Consideration",
    key: "variable_consideration",
    parent_id: 19,
    code: 431000,
    type: "Dr"
  },
  {
    id: 69,
    number: "4.3.2",
    name: "Consideration Paid (Payable) to Customers",
    key: "consideration_paid_payable_to_customers",
    parent_id: 19,
    code: 432000,
    type: "Dr"
  },
  {
    id: 70,
    number: "4.3.3",
    name: "Other Adjustments",
    key: "other_adjustments",
    parent_id: 19,
    code: 433000,
    type: "Dr"
  },
  {
    id: 71,
    number: "5.1.1",
    name: "Material and Merchandise",
    key: "material_and_merchandise",
    parent_id: 20,
    code: 511000,
    type: "Dr"
  },
  {
    id: 72,
    number: "5.1.2",
    name: "Employee Benefits",
    key: "employee_benefits",
    parent_id: 20,
    code: 512000,
    type: "Dr"
  },
  {
    id: 73,
    number: "5.1.3",
    name: "Services",
    key: "services_5_1",
    parent_id: 20,
    code: 513000,
    type: "Dr"
  },
  {
    id: 74,
    number: "5.1.4",
    name: "Rent, Depreciation, Amortization and Depletion",
    key: "rent_depreciation_amortization_depletion",
    parent_id: 20,
    code: 514000,
    type: "Dr"
  },
  {
    id: 75,
    number: "5.2.1",
    name: "Cost of Goods and Services Sold",
    key: "cost_of_goods_and_services_sold",
    parent_id: 21,
    code: 521000,
    type: "Dr"
  },
  {
    id: 76,
    number: "5.2.2",
    name: "Selling, General and Administrative Expense",
    key: "selling_general_administrative_expense",
    parent_id: 21,
    code: 522000,
    type: "Dr"
  },
  {
    id: 77,
    number: "5.2.3",
    name: "Uncollectible Accounts Expense (Reversal)",
    key: "uncollectible_accounts_expense_reversal",
    parent_id: 21,
    code: 523000,
    type: null
  },
  {
    id: 78,
    number: "5.3.1",
    name: "Freight Expense",
    key: "freight_expense",
    parent_id: 22,
    code: 531000,
    type: "Dr"
  },
  {
    id: 79,
    number: "5.3.2",
    name: "Customs Fees and Duty",
    key: "customs_fees_and_duty",
    parent_id: 22,
    code: 532000,
    type: "Dr"
  },
  {
    id: 80,
    number: "6.1.1",
    name: "Other Revenue",
    key: "other_revenue",
    parent_id: 23,
    code: 611000,
    type: "Cr"
  },
  {
    id: 81,
    number: "6.1.2",
    name: "Other Expenses",
    key: "other_expenses",
    parent_id: 23,
    code: 612000,
    type: null
  },
  {
    id: 82,
    number: "6.2.1",
    name: "Inventory Gain and Loss",
    key: "inventory_gain_and_loss",
    parent_id: 24,
    code: 621000,
    type: null
  },
  {
    id: 83,
    number: "6.2.2",
    name: "Gain (Loss), Foreign Currency Transaction",
    key: "gain_loss_foreign_currency_transaction",
    parent_id: 24,
    code: 622000,
    type: null
  },
  {
    id: 84,
    number: "6.2.3",
    name: "Gain (Loss) on Investments",
    key: "gain_loss_on_investments",
    parent_id: 24,
    code: 623000,
    type: null
  },
  {
    id: 85,
    number: "6.2.4",
    name: "Gain (Loss) on Derivatives",
    key: "gain_loss_on_derivatives",
    parent_id: 24,
    code: 624000,
    type: null
  },
  {
    id: 86,
    number: "6.2.5",
    name: "Crypto Asset Gain (Loss)",
    key: "crypto_asset_gain_loss",
    parent_id: 24,
    code: 625000,
    type: null
  },
  {
    id: 87,
    number: "6.2.6",
    name: "Gain (Loss) on Disposal of Assets",
    key: "gain_loss_on_disposal_of_assets",
    parent_id: 24,
    code: 626000,
    type: null
  },
  {
    id: 88,
    number: "6.2.7",
    name: "Debt Related Gain (Loss)",
    key: "debt_related_gain_loss",
    parent_id: 24,
    code: 627000,
    type: null
  },
  {
    id: 89,
    number: "6.2.8",
    name: "Impairment Loss",
    key: "impairment_loss",
    parent_id: 24,
    code: 628000,
    type: null
  },
  {
    id: 90,
    number: "6.2.9",
    name: "Other Gains and (Losses)",
    key: "other_gains_and_losses",
    parent_id: 24,
    code: 629000,
    type: null
  },
  {
    id: 91,
    number: "6.3.1",
    name: "Real Estate Taxes and Insurance",
    key: "real_estate_taxes_and_insurance",
    parent_id: 25,
    code: 631000,
    type: "Dr"
  },
  {
    id: 92,
    number: "6.3.2",
    name: "Highway (Road) Taxes and Tolls",
    key: "highway_road_taxes_and_tolls",
    parent_id: 25,
    code: 632000,
    type: "Dr"
  },
  {
    id: 93,
    number: "6.3.3",
    name: "Direct Tax and License Fees",
    key: "direct_tax_and_license_fees",
    parent_id: 25,
    code: 633000,
    type: "Dr"
  },
  {
    id: 94,
    number: "6.3.4",
    name: "Excise and Sales Taxes",
    key: "excise_and_sales_taxes",
    parent_id: 25,
    code: 634000,
    type: "Dr"
  },
  {
    id: 95,
    number: "6.3.5",
    name: "Customs Fees and Duties (Not Classified as Sales or Excise)",
    key: "customs_fees_and_duties_not_sales_or_excise",
    parent_id: 25,
    code: 635000,
    type: "Dr"
  },
  {
    id: 96,
    number: "6.3.6",
    name: "General Insurance Expense",
    key: "general_insurance_expense",
    parent_id: 25,
    code: 636000,
    type: "Dr"
  },
  {
    id: 97,
    number: "6.3.7",
    name: "Administrative Fees",
    key: "administrative_fees",
    parent_id: 25,
    code: 637000,
    type: "Dr"
  },
  {
    id: 98,
    number: "6.3.8",
    name: "Fines and Penalties",
    key: "fines_and_penalties",
    parent_id: 25,
    code: 638000,
    type: "Dr"
  },
  {
    id: 99,
    number: "6.3.9",
    name: "Taxes, Miscellaneous",
    key: "taxes_miscellaneous",
    parent_id: 25,
    code: 639000,
    type: "Dr"
  },
  {
    id: 100,
    number: "6.3.10",
    name: "Other Taxes and Fees",
    key: "other_taxes_and_fees",
    parent_id: 25,
    code: 640000,
    type: "Dr"
  },
  {
    id: 101,
    number: "7.1.1",
    name: "Intercompany Balances (Eliminated in Consolidation)",
    key: "intercompany_balances_eliminated",
    parent_id: 26,
    code: 711000,
    type: 'Dr'
  },
  {
    id: 102,
    number: "7.1.2",
    name: "Related Party Balances (Reported or Disclosed)",
    key: "related_party_balances_reported",
    parent_id: 26,
    code: 712000,
    type: 'Dr'
  },
  {
    id: 103,
    number: "7.1.3",
    name: "Investments in and Advance to Affiliates, Subsidiaries, Associates, and Joint Ventures",
    key: "investments_in_affiliates_subsidiaries",
    parent_id: 26,
    code: 713000,
    type: 'Dr'
  },
  {
    id: 104,
    number: "7.2.1",
    name: "Intercompany Balances (Eliminated in Consolidation)",
    key: "intercompany_balances_eliminated_consolidation",
    parent_id: 27,
    code: 721000,
    type: "Cr"
  },
  {
    id: 105,
    number: "7.2.2",
    name: "Related Party Balances (Reported or Disclosed)",
    key: "related_party_balances_disclosed",
    parent_id: 27,
    code: 722000,
    type: "Cr"
  },
  {
    id: 106,
    number: "7.3.1",
    name: "Intercompany and Related Party Income",
    key: "intercompany_related_party_income",
    parent_id: 28,
    code: 731000,
    type: "Cr"
  },
  {
    id: 107,
    number: "7.3.2",
    name: "Intercompany and Related Party Expenses",
    key: "intercompany_related_party_expenses",
    parent_id: 28,
    code: 732000,
    type: "Dr"
  },
  {
    id: 108,
    number: "7.3.3",
    name: "Income (Loss) from Equity Method Investments",
    key: "income_loss_equity_method_investments",
    parent_id: 28,
    code: 733000,
    type: null
  },
] as const;

export const LEDGER_ACCOUNT_TYPES = {
  CREDIT: "cr",
  DEBIT: "dr",
} as const;

export const DEFAULT_LEDGER_ACCOUNT_KEYS = {
  FREIGHT_IN: "freight_in",
  BROKERAGE_CHARGES: "brokerage_charges",
  INVENTORY_IN_TRANSIT: "inventory_in_transit",
  FINISHED_GOODS: "finished_goods",
  CASH_BANK: "cash_bank",
  COGS: "cogs",
  GOODS_SOLD: "goods_sold",
  STATE_TAX: "state_tax",
  COUNTY_TAX: "county_tax",
} as const;

export const FREIGHT_BILL_ACCOUNT_KEYS = {
  FREIGHT_IN: DEFAULT_LEDGER_ACCOUNT_KEYS.FREIGHT_IN,
  BROKERAGE_CHARGES: DEFAULT_LEDGER_ACCOUNT_KEYS.BROKERAGE_CHARGES,
} as const;
