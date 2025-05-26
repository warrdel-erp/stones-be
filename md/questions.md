1. how to decide when we consider slab is in transit.
2. how to decide payment is pending for PO. [discussed]
3. why are we getting receiving data during creating slab.
   - [slabs will be added before it reaches warehouse]
4. what is client user flow. [SKIP]
5. what are other charges in PO and SIPL are they different from bills. [remove-other-charges]
6. Can bin be multiple for a product? [add-a-default-bin]
7. Unit freight if slabs are not added? [RESOLVED]
8. Unit landed cost or average landed cost? [average-of-landed-cost-for-each-sipl-for-given-product]
9. payment Page UI jatin Doubt.
10. Update slab when and why. [can-change-before-receive-inventory]
11. Product tabs:

    1. Slabs in inventory for a product []
    2. Slabs in allocated for a product
    3. Hold slabs for a product.
    4. List of Sos’ in which this product exists.
    5. Special pricing?
    6. Last tabs in product details?

12. Payment hold in SIPL?[just-an-information]
13. Vendor:
    1. What is parent location[remit-address].
    2. Address for vendor.
    3. Accounting info for vendor?
    4. Supplier balance?
14. PO listing:
    1. Total[total-of-sipls] and paid[total-paid-of-SIPLs] in PO list?
15. what is reorderQuantity unit in product.
16. inventory balance explanation? **What is role of inCart**
    1. in-stock[total-which-is-not-sold-or-initiated] -> **IN_INVENTORY or ALLOCATED**
    2. available[not-hold-or-allocated-or-sold-initiated]
17. lead time in create product[REMOVE]
    special pricing.
    leads.

---

1. can bill be partially paid if yes then when will we consider it as totally paid.
2. do we've to keep record of payment group in payment because we are paying multiple bills in once.

---

1. when add freight journal entry then which reference to keep bill or SIPL. [both]
2. we are adding journal entries for freight bill as received area, but what freight bill is been added before slabs. [different-entries]
3. Account of vendor.
4. Closing balance of vendor.
5. Why keys are different as invoice to transaction.
6. Why fulfilled is in percentage in LO it must be as string og stage.[done]

---

1. If soProduct is swapped to another LO product then what will happen to that LO product.
2. what is different between SO status (completed, cancelled, closed)
3. is it possible there is different number of product in loadingOrder and packagingList. If yes then what will happen to slabs in LO during invoicing.
4. if slab is swapped then where it's remeasures will be stored.
5. if PL is been created then can we swap of pick from LO.

---

1. is "Cash bank" under "Cash and Cash Equivalents" is default account.[No]
2. Second journal entry in SO (Total area of slab _ Landed cost of that slab) or (unit price in soProduct _ remeasurement in SO).

---

1. can one LO have multiple Trucks.
2. where to show truck list.
3. what to show in general account, account payables, account receivables.[ledger]
4. what if siplProduct is added but Slabs are not added in it then unit landed cost is infinite then what should we do.
5. where to show "Journal before received Inventory" in journal entries.
6. what is So location in create SO.
7. while remeasuring data should be prefilled for slab in LO and PL.
8. can on SO have multiple Journal entries then journal entry belongs to LO.

---

1. what is subheader for freight vendor

2. Is there also multiple roles that user can contain under on client.

3. will slab deleted from cart if it is been added in so.

4. how to decide unit price of slab in cart to SO.

5. we've array of addresses of customer how to CRUD on UI.
