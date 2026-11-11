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


---

## 5. Bad Debt Expense (Customer Write-Off)
- **COA Location**: `Expenses` → `Expenses (Classified by Function)` → `Uncollectible Accounts Expense (Reversal)` | **Normal Balance**: **Debit (DR)**
- **Before**: No default `Bad Debt Expense` account or write-off flow existed to clear uncollectible customer invoice balances.
- **Now**: Under the **Direct Write-Off Method**, when an unpaid customer invoice balance is deemed uncollectible and written off, `Bad Debt Expense` is debited (`DR`) as an operating credit-loss expense and the `Customer Account (Receivable)` is credited (`CR`) to clear the unpaid balance without reducing `Goods Sold`.

**Example**: Customer pays \$800 on a \$1,000 invoice and defaults on the remaining \$200 (written off)

| Step | Account | Debit (DR) | Credit (CR) | Purpose |
| :--- | :--- | ---: | ---: | :--- |
| **1. Invoice Created** | Customer Account (Receivable) | \$1,000 | — | Customer billed \$1,000 |
| | Goods Sold / Tax | — | \$1,000 | Revenue & tax recorded |
| **2. Partial Payment** | Cash / Bank | \$800 | — | Cash received |
| | Customer Account (Receivable) | — | \$800 | \$200 balance remains unpaid |
| **3. Customer Write-Off** | **Bad Debt Expense** | **\$200** | — | Record credit loss expense |
| | Customer Account (Receivable) | — | \$200 | Clear remaining customer receivable to \$0 |


---

## 6. Goods Received Not Invoiced (GRNI)
- **COA Location**: `Liabilities` → `Payables` → `Other Accounts Payable and Accrued Liabilities` | **Normal Balance**: **Credit (CR)**
- **Status in Software**: **Default ledger account created, but its journal entries are NOT stored.**
- **Why Journal Entries Are Not Stored**:
  - `GRNI` is used **only if inventory receipt precedes the vendor bill** (receiving goods into `Finished Goods` before the supplier sends an invoice).
  - In Stone CRM, purchasing strictly follows **`PO` → `SIPL (Supplier Invoice & Packing List)` → `Receive Inventory`**, and Freight Bills must also be added before `Receive Inventory`.
  - Because the vendor bill (`SIPL`) always precedes physical receipt in our software, the system records **`Inventory In Transit`** instead of **`GRNI`**, so no journal entries are posted to `GRNI`.

**Example (If Receipt Precedes Vendor Bill — \$5,000 Slab Shipment)**:

| Step | Account | Debit (DR) | Credit (CR) | Purpose |
| :--- | :--- | ---: | ---: | :--- |
| **1. Goods Received (No Bill Yet)** | Finished Goods (Inventory) | \$5,000 | — | Record inventory received into stock |
| | **Goods Received Not Invoiced (GRNI)** | — | **\$5,000** | Accrue unbilled inventory liability |
| **2. Vendor Bill Arrives Later** | **Goods Received Not Invoiced (GRNI)** | **\$5,000** | — | Clear GRNI accrual to \$0 |
| | Vendor Account (Payable) | — | \$5,000 | Record actual payable owed to supplier |


---

## 7. Accounts Payable Write-off Income (Vendor Write-Off)
- **COA Location**: `Other (Non-Operating) Income and Expenses` → `Other Revenue and Expenses` → `Other Revenue` | **Normal Balance**: **Credit (CR)**
- **Before**: No default `Accounts Payable Write-off Income` account or vendor write-off flow existed to extinguish unpaid balances on Supplier Invoices (`SIPL`) or Vendor/Freight Bills (`Bill`).
- **Now**: When an unpaid vendor payable balance is validly extinguished without cash payment (e.g., supplier waives a small remaining balance or debt is legally extinguished), the `Vendor Account (Accounts Payable)` is debited (`DR`) to clear the liability owed to the vendor, and `Accounts Payable Write-off Income` is credited (`CR`) as non-operating income without altering inventory cost.

**Example**: \$5,000 Supplier Invoice (`SIPL`), \$4,800 paid via bank transfer, remaining \$200 waived/extinguished by supplier

| Step | Account | Debit (DR) | Credit (CR) | Purpose |
| :--- | :--- | ---: | ---: | :--- |
| **1. SIPL Created** | Inventory In Transit | \$5,000 | — | Record purchased inventory |
| | Vendor Account (Payable) | — | \$5,000 | Record \$5,000 payable owed to supplier |
| **2. Partial Payment** | Vendor Account (Payable) | \$4,800 | — | Reduce vendor payable to \$200 |
| | Cash / Bank | — | \$4,800 | Cash paid out |
| **3. Vendor Write-Off** | Vendor Account (Payable) | \$200 | — | Extinguish remaining \$200 vendor payable to \$0 |
| | **Accounts Payable Write-off Income** | — | **\$200** | Record non-operating income from AP write-off |


---

## 8. Inventory Adjustment Gain (Positive Stock Differences)
- **COA Location**: `Other (Non-Operating) Income and Expenses` → `Gains and Losses` → `Inventory Gain and Loss` | **Normal Balance**: **Credit (CR)**
- **Before**: When receiving an SIPL into inventory (`Receive Inventory`), if the total value of physical slabs received into `Finished Goods` (`DR`) exceeded the billed `Inventory In Transit` (`CR`), the balancing `CR` entry was posted back to `Inventory In Transit`, leaving an artificial credit balance in `Inventory In Transit`.
- **Now**: Positive stock differences (`Finished Goods` received > billed SIPL cost) are credited (`CR`) to `Inventory Adjustment Gain`, while `Inventory In Transit` clears cleanly to \$0.

**Example**: SIPL billed for 100 sq ft at \$50/sq ft (\$5,000), but actual measured/packaged slabs received into `Finished Goods` total 104 sq ft (\$5,200)

| Step | Account | Debit (DR) | Credit (CR) | Purpose |
| :--- | :--- | ---: | ---: | :--- |
| **1. SIPL Created** | Inventory In Transit | \$5,000 | — | Billed inventory in transit (100 sq ft) |
| | Vendor Account (Payable) | — | \$5,000 | Payable owed to supplier |
| **2. Receive Inventory** | Finished Goods (Inventory) | \$5,200 | — | Actual slabs received into stock (104 sq ft) |
| | Inventory In Transit | — | \$5,000 | Clear Inventory In Transit to \$0 |
| | **Inventory Adjustment Gain** | — | **\$200** | Record positive stock gain (+4 sq ft) |


---

## 9. Inventory Adjustment Loss (Breakage, Damage & Negative Stock Differences)
- **COA Location**: `Other (Non-Operating) Income and Expenses` → `Gains and Losses` → `Inventory Gain and Loss` | **Normal Balance**: **Debit (DR)**
- **Before**:
  1. **Receive Inventory Shortage**: When received `Finished Goods` (`DR`) was less than billed `Inventory In Transit` (`CR`), the balancing `DR` entry was posted back to `Inventory In Transit`, leaving an uncleared debit balance in `Inventory In Transit`.
  2. **Slab Breakage / Split (`SLAB_SPLIT`)**: When a broken slab was split into smaller usable remnants whose combined value was less than the original slab, no entry was created for the lost area, leaving the journal unbalanced.
- **Now**: Both negative stock differences on `Receive Inventory` and area/value lost during `Slab Split` breakage are debited (`DR`) to `Inventory Adjustment Loss`.

**Example A (Receive Inventory Shortage)**: SIPL billed for 100 sq ft at \$50/sq ft (\$5,000), but actual received slabs total 96 sq ft (\$4,800)

| Step | Account | Debit (DR) | Credit (CR) | Purpose |
| :--- | :--- | ---: | ---: | :--- |
| **1. SIPL Created** | Inventory In Transit | \$5,000 | — | Billed inventory in transit (100 sq ft) |
| | Vendor Account (Payable) | — | \$5,000 | Payable owed to supplier |
| **2. Receive Inventory** | Finished Goods (Inventory) | \$4,800 | — | Actual slabs received into stock (96 sq ft) |
| | **Inventory Adjustment Loss** | **\$200** | — | Record negative stock difference (-4 sq ft) |
| | Inventory In Transit | — | \$5,000 | Clear Inventory In Transit to \$0 |

**Example B (Slab Breakage / Split)**: A 60 sq ft slab (\$3,000) breaks and is split into two usable remnants totaling 50 sq ft (\$2,500), losing 10 sq ft (\$500) to breakage

| Account | Debit (DR) | Credit (CR) | Purpose |
| :--- | ---: | ---: | :--- |
| Finished Goods (New Remnant Slabs) | \$2,500 | — | Capitalize salvageable split pieces (50 sq ft) |
| **Inventory Adjustment Loss** | **\$500** | — | Expense shattered/unusable portion (10 sq ft) |
| Finished Goods (Original Broken Slab) | — | \$3,000 | Remove original broken slab (60 sq ft) from stock |
| **Total** | **\$3,000** | **\$3,000** | |


---

## 10. Landed Cost Clearing
- **COA Location**: `Assets` → `Accruals and Additional Assets` → `Additional Assets` | **Normal Balance**: **Debit (DR)**
- **Status in Software**: **Default ledger account created, but its journal entries are NOT stored.**
- **Why Journal Entries Are Not Stored**:
  - In standard accounting, `Landed Cost Clearing` is a temporary current asset account used to hold inbound freight, customs duty, and brokerage costs before they are allocated into `Finished Goods`.
  - In Stone CRM, when a Freight Bill is added to an SIPL (`Add Freight Bill`), the system directly debits the specific expense/clearing account selected on the bill item (`Freight-In` or `Brokerage Charges`), and when inventory is received (`Receive Inventory`), those exact accounts (`Freight-In` / `Brokerage Charges`) are credited to clear their balances directly into `Finished Goods` at the calculated landed unit cost.
  - Because `Freight-In` and `Brokerage Charges` already act as the pass-through clearing accounts during `Add Freight Bill` → `Receive Inventory`, no separate journal entries are stored in `Landed Cost Clearing`.

**Example (Standard Landed Cost Clearing Flow — \$5,000 Slabs + \$600 Ocean Freight)**:

| Step | Account | Debit (DR) | Credit (CR) | Purpose |
| :--- | :--- | ---: | ---: | :--- |
| **1. Freight Bill Recorded** | **Landed Cost Clearing** *(or Freight-In in Stone CRM)* | **\$600** | — | Hold eligible inbound freight for allocation |
| | Freight Vendor Account (Payable) | — | \$600 | Record payable owed to freight carrier |
| **2. Receive Inventory** | Finished Goods (Inventory) | \$5,600 | — | Capitalize slabs at full landed cost (\$5,000 + \$600) |
| | Inventory In Transit | — | \$5,000 | Clear billed slab cost to \$0 |
| | **Landed Cost Clearing** *(or Freight-In in Stone CRM)* | — | **\$600** | Clear allocated freight cost into inventory to \$0 |


---

## 11. Outward Freight Expense (Vendor Charges for Customer Deliveries)
- **COA Location**: `Expenses` → `Expenses (Classified by Function)` → `Selling, General and Administrative Expense` | **Normal Balance**: **Debit (DR)**
- **Status in Software**: **Default ledger account created, but its journal entries are NOT stored.**
- **Why Journal Entries Are Not Stored**:
  - `Outward Freight Expense` (Freight-Out) is a selling & distribution expense used when a third-party freight carrier or delivery vendor bills the company for delivering goods to a customer.
  - In Stone CRM:
    1. **Vendor Freight Bills (`Bill`)** can only be created against an inbound **`SIPL`** (`BILL_REFERENCE_TYPES.SIPL`), which is inbound purchasing freight capitalized into inventory. There is no vendor bill flow for Sales Orders, Loading Orders, Packaging Lists, or Customer Deliveries.
    2. **Customer Deliveries (`Delivery`)** are dispatched using internal company **`Truck`** and driver records without third-party vendor bills.
    3. **Delivery Services on Sales (`Home Delivery`, `Express Delivery`)** bill the **customer** (`DR Customer Receivable / CR Delivery Charges Revenue`) rather than recording a vendor charge.
  - Because the software has no third-party vendor bill flow for outbound customer deliveries, no journal entries are stored in `Outward Freight Expense`.

**Example (If a Third-Party Carrier Billed \$180 for Customer Delivery)**:

| Step | Account | Debit (DR) | Credit (CR) | Purpose |
| :--- | :--- | ---: | ---: | :--- |
| **1. Carrier Bill Recorded** | **Outward Freight Expense** | **\$180** | — | Record outbound customer delivery cost as selling expense |
| | Freight Vendor Account (Payable) | — | \$180 | Record payable owed to delivery carrier |
| **2. Carrier Bill Paid** | Freight Vendor Account (Payable) | \$180 | — | Clear carrier payable to \$0 |
| | Cash / Bank | — | \$180 | Cash paid to carrier |


---

## 12. Payment Clearing (Settlement / Undeposited Funds)
- **COA Location**: `Assets` → `Cash and Financial Assets` → `Cash and Cash Equivalents` | **Normal Balance**: **Debit (DR)** *(may temporarily carry a Credit balance for outgoing in-transit payments)*
- **Status in Software**: **Default ledger account created, but automated clearing/settlement journal entries are NOT stored.**
- **Why Journal Entries Are Not Stored**:
  - In a two-step banking & settlement workflow, `Payment Clearing` (Undeposited Funds) holds receipts (checks, credit cards, ACH) or outgoing disbursements in transit until they settle on the bank statement and are cleared into `Cash / Bank`.
  - In Stone CRM, recording a Customer Receipt, Advance Deposit, or Vendor Payment (`processPayment` / `createAdvancedDeposit`) is a **single-step** process: the payment is immediately marked `completed` and posted directly to the selected `Cash / Bank` ledger account without a separate bank deposit or settlement reconciliation workflow. Because there is no two-step settlement/bank-reconciliation flow in the software, automated clearing entries are not stored in `Payment Clearing`.

**Example A (Incoming Customer Check / Card Settlement — \$1,000)**:

| Step | Account | Debit (DR) | Credit (CR) | Purpose |
| :--- | :--- | ---: | ---: | :--- |
| **1. Payment Received (Undeposited)** | **Payment Clearing** | **\$1,000** | — | Hold undeposited check/card receipt in clearing |
| | Customer Account (Receivable) | — | \$1,000 | Mark customer invoice as paid |
| **2. Bank Deposit Settled** | Cash / Bank | \$1,000 | — | Record actual funds settled into bank account |
| | **Payment Clearing** | — | **\$1,000** | Clear undeposited funds to \$0 |

**Example B (Outgoing Vendor Payment In-Transit — \$2,000, Carrying Temporary Credit Balance)**:

| Step | Account | Debit (DR) | Credit (CR) | Purpose |
| :--- | :--- | ---: | ---: | :--- |
| **1. Vendor Check / ACH Issued** | Vendor Account (Payable) | \$2,000 | — | Mark vendor bill as paid |
| | **Payment Clearing** | — | **\$2,000** | Record outgoing payment in transit (temporary `CR` balance) |
| **2. Bank Clears Payment** | **Payment Clearing** | **\$2,000** | — | Clear in-transit payment to \$0 |
| | Cash / Bank | — | \$2,000 | Reduce bank balance upon bank clearance |




