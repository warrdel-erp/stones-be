# Chart of Accounts (COA) — Accounting Scenarios

---

## 1. Sales Discounts
- **COA Location**: `Revenue` → `Adjustments` → `Variable Consideration (Contra Revenue)` | **Normal Balance**: **Debit (DR)**
- **Before**: Discounts had no separate ledger entry. Item discounts were subtracted directly from `Goods Sold`, and order-level discounts caused an imbalance between `Goods Sold` and `Customer Receivable`.
- **Now**: `Goods Sold` records full gross sales, `Sales Discounts` records all discounts (`DR`), and the customer is billed the exact net payable amount.

**Example**: \$1,000 Gross Sale, \$100 Discount, \$90 Tax (10% on \$900)

| Account | Debit (DR) | Credit (CR) |
| :--- | ---: | ---: |
| Customer Account (Receivable) | \$990 | — |
| **Sales Discounts (Contra-Revenue)** | **\$100** | — |
| Goods Sold (Gross Revenue) | — | \$1,000 |
| State / County Tax Payable | — | \$90 |
| **Total** | **\$1,090** | **\$1,090** |

---

## 2. Sales Returns & Allowances
- **COA Location**: `Revenue` → `Adjustments` → `Variable Consideration (Contra Revenue)` | **Normal Balance**: **Debit (DR)**
- **Before**: Confirmed returns debited `Goods Sold` directly (hiding return volume from gross sales) and mistakenly included tax in the revenue reversal alongside the separate tax entries.
- **Now**: Confirmed returns debit `Sales Returns & Allowances` (`DR`) for the net pre-tax return value, debit tax payables for the tax portion, credit the customer's receivable for the total, and restore the item to `Finished Goods` from `COGS`.

**Example**: Returned slab sold for \$500 + \$50 tax (\$550 total), landed cost \$300

| Account | Debit (DR) | Credit (CR) | Purpose |
| :--- | ---: | ---: | :--- |
| **Sales Returns & Allowances** | **\$500** | — | Record returned revenue |
| State / County Tax Payable | \$50 | — | Reverse sales tax liability |
| Customer Account (Receivable) | — | \$550 | Reduce customer balance owed |
| Finished Goods (Inventory) | \$300 | — | Restore slab to stock at cost |
| Cost of Goods Sold (COGS) | — | \$300 | Reverse cost of sale |
| **Total** | **\$850** | **\$850** | |

---

## 3. Customer Advances (Advanced Deposits)
- **COA Location**: `Liabilities` → `Accruals, Deferrals and Additional Liabilities` → `Deferred Income and Refund Liabilities` | **Normal Balance**: **Credit (CR)**
- **Before**: Receiving an advance deposit credited the `Customer Account (Receivable)` directly before any invoice existed, and settling the deposit against an invoice recorded no journal entry.
- **Now**: Receiving an advance deposit credits `Customer Advances` (Liability). When settled against a Sales Invoice (automatically or manually), the settled amount moves from `Customer Advances` (`DR`) to the `Customer Account` (`CR`).

**Example**: \$400 Advance Deposit on a \$1,000 Sales Order, later invoiced for \$1,000

| Step | Account | Debit (DR) | Credit (CR) | Effect |
| :--- | :--- | ---: | ---: | :--- |
| **1. Advance Received** | Cash / Bank | \$400 | — | Cash increases by \$400 |
| | **Customer Advances (Liability)** | — | **\$400** | Liability of \$400 recorded |
| **2. Invoice Created** | Customer Account (Receivable) | \$1,000 | — | Customer billed \$1,000 |
| | Goods Sold / Tax | — | \$1,000 | Revenue & tax recorded |
| **3. Deposit Settled** | **Customer Advances (Liability)** | **\$400** | — | Advance liability cleared to \$0 |
| | Customer Account (Receivable) | — | \$400 | Customer remaining due becomes \$600 |


---

## 4. Delivery Charges Revenue
- **COA Location**: `Revenue` → `Recognized Point of Time` → `Services` | **Normal Balance**: **Credit (CR)**
- **Before**: Delivery services (`Home Delivery`, `Express Delivery`) were mapped to `Default Service Account` (which sat under `Expenses`, Debit normal) instead of a dedicated revenue account.
- **Now**: `Delivery Charges Revenue` (`CR`) is created under Service Revenue. Delivery service items are linked to this ledger account. When a delivery service is added to a Packaging List or Loading Order and invoiced, the customer is billed for the delivery charge and `Delivery Charges Revenue` is credited.

**Example**: \$1,000 Slab Sale + \$90 Tax + \$150 Delivery Charge (\$1,240 Total Invoice)

| Account | Debit (DR) | Credit (CR) | Purpose |
| :--- | ---: | ---: | :--- |
| Customer Account (Receivable) | \$1,090 | — | Product + tax receivable |
| Customer Account (Receivable) | \$150 | — | Delivery charge receivable |
| Goods Sold (Revenue) | — | \$1,000 | Slab sales revenue |
| State / County Tax Payable | — | \$90 | Sales tax liability |
| **Delivery Charges Revenue** | — | **\$150** | Delivery service revenue |
| **Total** | **\$1,240** | **\$1,240** | |
