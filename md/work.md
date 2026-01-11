1. User login (with JWT) ✔️
2. Drop Database, Retest everything, create project setup docs, Put code on github.✔️
3. create system for SIPL different from PO ✔️
4. Receive inventory. ✔️
5. Inventory Data. ✔️
6. All user list for a given client
7. configure api according to authentication and don't accept createdBy in payload get it from user TOKEN(Question for every API that who can CRUD this.)
8. check every id that corresponding data exists.
9. send client id in userLogin
10. COA (type, head, subhead)

    1. ledger opening date
    2. journal (transaction)
    3. payment is different from
    4. entity (ledger, journal)
    5. customer

11. check location belongs to client that is being assigned to user.
12. map every data and operation with location.
13. create client login
14. filter for PO,
15. sales Order process. ✔️
16. rollback every transaction.
17. restructure customer.
18. put all table relations in their specific model files.
19. po number should start from 1 for every client.
20. keep reference type of notes as enum.
21. vendor list according to type
22. check every update and create when it could be done. like after invoice lo can not be updated.
23. Retrieve notes data with SO
24. edit requested purchase order(get array of products, if id is null create one otherwise update) delete API.
25. send location, freight in PO, product in single PO
26. number of invoices in all PO details
27. vendor type national
28. const data as Jatin sent list. ✔️
29. fulfilled PO => how much sipl is created for given po product. in SINGLE PO, SINGLE SIPL ✔️
30. in salesOrderProduct combination of inventoryProductId and salesOrderId
31. po number, ✔️
32. sipl (po1 - sipl1, sipl2) according to PO ✔️
33. supplier invoice no. (custom number) ✔️
34. invoice no according to client ✔️
35. sipl product belongs to -> requested purchase product ✔️
36. single SIPL by detail by ID ✔️
37. vendor with type filter. ✔️
38. bill no. auto generated and API to get new BILL number ✔️

39. Add freight detail in SIPL single data and PO. ✔️
40. Receive inventory status in SIPL and receive date. ✔️
41. Sales Tax data in general ✔️

42. Slab in cart or not ✔️

43. Total fulfilled of requestedProducts in single PO ✔️
44. check in add slab is given siplProductId belongs to given SIPLId ✔️
45. Conditions for closing and canceling PO.

46. total receiving and packaging quantity in sipl products. ✔️
47. slab no. auto increment. ✔️
48. freight bill. ✔️
49. receive inventory data. ✔️
50. container separate model ✔️
51. update slabs. ✔️
52. product more data like single slab price. ✔️
53. product tabs. 👨‍💻
54. Set default user location error for not access.
55. SIPL detail Notes Populate. ✔️
56. drawer data in inventory. ✔️
57. keep everything in SIPL as in PO
58. add address in customer creation. ✔️
59. Payment:

    1. Vendors according to SIPL for ✔️
    2. Pending bills according to vendor. ✔️
    3. New Transaction no. ✔️
    4. Reference No. Reference date. ✔️

60. Master:

    1. Master vendor list ✔️

61. Customer:

    1. Address with customer creation. ✔️

62. Sales order:

    1. Add slabs with creation of SO.
    2. Slabs list by product. ✔️

63. keep total of bill items in bill
64. subReferenceId and subReferenceId ✔️

65. fix clientPOnumber

66. Sipl serial number structure change.
67. Slab serial number structure change.
68. Unit landed cost in sipl page items.

69. Total in by qty in fright bill tab in SIPL page.
70. Total landed cost in receive inventory

71. Barcode of slab.

72. Slabs selling price during receive inventory.

73. Inventory balance in SF

74. Is payment method in payment page from BE

75. In freight bills creation .Based on RQ and based on billed qty (but final calculations will be gone with received qty.)

76. Delivery location can different for SO, LO, PL

<!-- 77. Account number in ledger account  -->

78. salesOrderProduct is lo been created.
79. soData -> Lo slabs, LO total qty, LO amount, LO total tax., sales tax populate in SO customer.
80. Add tax calculation to every product.
81. paid amount in SIPL

82. clear loProduct and plProduct after SOproduct creation.
83. put pagination in truck API.
84. create another API for product list because it has unnecessary slabs data.
85. change referenceType in journal entry to invoiceType
86. payment ledger entry. and ledger account.
87. client filter for all. (like PO)

---

1. payload validations(req.body should not be passed directly to service.) .
2. model typescript support
3. remove any types
4. in product model (product.productName => product.name)
5. create flow diagram for every flow 48. put constants in tables for better data fetching
6. Restructure sipl calculations acc
7. Set value in getting model

---

copy loading order to invoice page.
create a SO journal entries page in invoice.
copy journal entry page from PO list.

---

Cross check.

Dashboard

1. Sales in 30 days amount.
2. Purchase amount
3. Total pending amount customer and vendor

Product accounts
1st -> marchecdise accounts.
2nd -> goods account -> Goods sold
3rd -> header of -> cogs

—————————

Customer -> 1. User list 2. Remove price level. In list. ✅

PO->
only can be cancelled which does not contain SIPL.

SIPL creation -> SIPL number, invoice number remove.✅

SIPL list -> , Transaction (correct SIPL number), remove invoice number. ✅

Dashboard -> SIPL In transit

Inventory -> not working. ✅

Make payment is not correct.
Payments on SIPL page.

SIPL Journal entries error. ✅
SIPL journal entry id.

Create SO -> add slab quantity, data according to sipl

Don’t show picked in SO invoice

So product select total quantity. ✅

SO journal entry order

Header have cr or dr types

———
Make payment account dropdown => cash and cash equivalents (subheader)

Freight item expense (type) .

Bills invoiceCode.

Add a vendor bill option.

————

Dashboard =>
welcome message ✅
loading … with blank data

product=>
Single slab price in product list. ✅  
 Edit in all.
active inactive ✅
Customer =>
payment pending for customer.
active, inactive, payment pending ✅
Supplier =>
active inactive ✅

Vendor =>
Freight type ✅

General ledger =>
balance is not visible in list.

#######
Journal entry =>
opening balance ✅

Account payable, ✅
Account receivable. ✅
Sales invoice ✅.

In COA put type in header

Po =>
location contact detail.
SIPL SIPL two times ✅

Slab =>
barcode pattern
slab number should start with given number ✅
Freight bill =>
Freight bill number.

Inventory =>
first view data is not complete.
landed cost
selling price

Inventory received date in sipl detail page

Accounts in payment.
Serial number and location in journal entry.

So => tax
Add loading order => calculations.
Add packaging list => calculations

SO journal entry
So list => Sub transaction

Return , sales invoice => same data as deliveries.

Journal entry balance calculation =>
dr type account => dr -cr
cr type account => cr - dr

Location list.
Transaction list.

Icons
Location wise.

---

```
Remove date range from
 => product ✅, customer. ✅

Create product =>
Subcategory should work according to category ✅

Create supplier =>
	address and suite should not be in different input it should be one.

Create customer =>
	sales person list  ✅

Create PO =>
	1. contact info for supplier, both locations. ✅
	2. Payment terms dropdown in create PO. ✅

PO detail page =>
	1. If SIPL is been created then PO can’t be changed. And before it should be.

SIPL details page =>
	1. Add slab => slab number should not show “SIPL” text ✅
	2.  In freight bill label should be on “billed quantity” ✅
	3. Heading should	 not have two times “SIPL” ✅
	4. Slab No default value. ✅

Inventory =>
	1. color ✅
	2. Status icons.
	3. Available label ✅
	4. Allocated should be present in list but unable to add in cart ✅

Navbar =>
	1. cart items count ✅
	2. UI changes to add and remove cart item. ✅

In SO detail page
	1. Selling price should be editable 🤨 [when can we change price in SO.]
	2. Tax bifurcation according 🤨 [is tax product wise or slab wise in SO?]
	3. Print should be a hamburger and it should show “print LO”, “print PL”, “print invoice” ✅

Create LO
	1. Tax calc.

SO journal entry
	1. It should be customer instead of Freight vendor. ✅
	2. Heading is wrong. ✅

COA =>
	Create account =>
		1. Account type should be fetched from header type.

Customer Payment  =>
	1. account should come from same as supplier accounts. ✅

SIPL detail =>
	1. Inventory received date.
	2. Payment receipt number list.

SIPL journal entry =>
	1. payment account is not as selected. ✅

Some details should be shown in all list as in return list.

SO list =>
	1. address

Dashboard =>
	1. “PO in transit” UI.

SO from cart form => all mediation message should visible.

Bar code

PO Detail

```

---

```
Direct SIPL =>
	 payment terms error. ✅
	all list is now showing. ✅


Change all ALERT error messages.

Freight bill =>
	 based on received quantity

Inventory slab detail =>
	 Last landed cost. ✅

Sidebar =>
	sales should  before invoices ✅

SO create =>
	second heading should be customer invoice/PL/LO ✅
	add more product is not working. ✅

SO detail page =>
	delete button in front of slab.
	print dropdown should be only available invoices

SO journal entry =>
		slab amount is wrong (10x) ✅

LO detail page =>
 	Order quantity is for whole SO it should be only for LO. ✅
	SO list =>	SO tabs. ✅

Cart SO creation =>	remove soLocation ✅

SO cancelation =>
	redirecting to PO list page. ✅

PL cancel page => not working correctly.  ✅

——

1. Hold in inventory. ✅
2. Landed cost in Slab drawer. ✅
3. Total amount in add product in SO. ✅
4. Tax checkbox in SO. ✅
5. Add more product in SO. ✅
6. Payment terms in LO auto complete. ✅
7. Tax info in LO/PL. ✅
8. Receive payment in invoice. ✅
9. SO location is freezed to current location. ✅
10. Add product in SO should be as Location. ✅
11. Address info in SO Invoice. ✅
```

---

1. change SIPL - Vendor Invoice (#VI) ✅

- Lot to bundle ✅

2. Integrate capturing images with slabs; missing images to be available

3. block wise, bundle number wise data hierarchy in inventory

4. Show Avg size in sipl

5. Block specific pricing update option

6. Direct SO creation Hold from inventory

7. Defaults address and todays date ✅

8. Redirect ✅

9. Remeasure to be autofilled default with an option to edit

10. Swap option within the same block

11. Advance deposit option in SO ✅

12. QR code activate

13. Payment gateway

14. Invoice missing - ship date - Weight not required - customer PO required - lead# not required

15. Packing List - Delivery charge option present - discount

---

1. Icons in inventory for status ✅
2. Product name bold in inventory ✅
3. So create tax. ✅
4. Slab dimension in invoice.
5. Print invoice button on SO page. ✅
6. Journal entry for so invoice.
7. Customer make payment. ✅
8. Cancel button in RO. ✅
9. Transaction No. ✅
10. missing data in create LO ✅

---

•⁠ ⁠balance sheet and profit and loss sheet ✅
•⁠ ⁠⁠transaction list with Receipt prints
•⁠ ⁠⁠geolocations in customer ✅
•⁠ ⁠⁠delivery assigning via geolocation
•⁠ geoLocation in location ✅

---

1. customer address change according to new payload. ✅
2. system location according to map. ✅
3. delivery locations on map. ✅
4. transaction detail page API.

---

1. Journal entry total calculation according to cr and dr.
2. multiple deliveries system design.

---

major delivery handled ->

1. keeping separate location data in invoice-delivery so in future if customer's address changed it should remain same.
2.

---

1. journal entry for generic product on loading Order, Return.
2.

3. lot pricing ✅
4. remove Status from slab
5. bifurcate address from vendor.
6. remove unnecessary fields from customer.

```
1. Unit price in add product in SO. ✅
2. Product data optimisation. ✅
3. Product details in SO add product. ✅
4. Due data  in SO. ✅
5. Tax must be selected by default. ✅
6. Tax can not be edited after SO creation ✅
7. Advanced deposit more data show. ✅
8. Picked is removed. ✅
9. Swap check (Data Show). ✅
10. Taxable is wrong for multiple products in SO.
11. Tax check box should freeze after creation.
12. Services must be created during create LO, PL.
13. Check all Totals.
14. State tax and County tax in SO.
15. Print invoice
16. Fulfill in SO list.
17. Initiate Return is not working.
18. Approval tab in Deliveries.
19. Credit/Debit note.
20. Pending amount must be calculated with advanced deposit and tax.
21. All transactions
```

```
1. Print invoice
2. Fulfill in SO list.
3. Initiate Return is not working.
4. Approval tab in Deliveries.
5. Credit/Debit note.
6. Pending amount must be calculated with advanced deposit and tax.
7. All transactions
8. Services journal entries, default accounts.
9. Cart.
10. Returns
11. Create new customer directly from SO, PO.
12. Packing and receiving forms will be separate for SIPL.
13. Deliveries will show non invoiced LO.
14. More details on Delivery page like time and km.

```

```

Multiple LO bug
Login with OTP.
Email notification.

```

---

1. Print invoice ✅
2. Fulfill in SO list.✅ [DOUBT]
3. Initiate Return is not working, Generic products data in returns. ✅
4. Approval tab in Deliveries. ✅
5. Credit/Debit note. ✅
6. Pending amount must be calculated with advanced deposit and tax in payment page. [If ]
7. All transactions
8. Services journal entries, default accounts. ✅
9. Cart.✅
10. Create new customer directly from SO, PO.
11. Packing and receiving forms will be separate for SIPL.
12. Deliveries will show non invoiced LO.
13. More details on Delivery page like time and km.
    14.Serial number of slabs in create SO. ✅
14. Cancel RO.
15. Customer shipping address in deliveries. ✅
16. Errors due to migrations. ✅
17. Returned Products are not showing in Inventory in SIPL filter.
18. Add customer Addresses in seeder.
19. Seed services
20.

---

---

1. Loading Orders section should take less space while empty. ✅
2. Tax is not visible on multiple pages. ✅
3. Some loader ✅
4. Some sidebar labels changed. ✅
5. Some design changes on login page. ✅
6. Enter and Escape shortcuts on Confirm dialog. ✅

---

1. Cart selection. ✅
2. Hold Slab is not selectable now in Cart. ✅
3. Payment Pages.
4. Inventory Data -> average landed, selling price, stock, remove kind, remove category. ✅
5. Dashboard.

---

1. If product is inactive it can’t be sold.
2. In create Customer first 3 section in one row. ✅
3. Customer details first 3 in single. ✅
4. Pick ticket -> loading order (in customer tab). ✅
5. Journal entry page. ✅
6. Deliveries UI (Initiate Deliveries and Create new Vehicle). ✅
7. Returns UI, Calculation and both type product feature. ✅
8. SIPL two step process. ✅
9. Vendor payment -> debit note to supplier if extra payment. ✅
10. Vendor payment. ✅
11. Advanced deposit design. -> due must be affected. ✅
12. Totals in customer payment.
13. Customer payment submit popup. ✅
14. Journal entry for credit note [Pending(what-is-account-for-credit-note-journal-entry)] and advanced deposit [is-this-one-is-correct]. ✅
15. Customer Payment journal entry.
16. Last closing entries in journal entries.
17. Cart to SO. ✅
18. Direct SIPL. ✅
19. Hold-Unhold. ✅
20. Customer details page tab scroll. ✅
21. cart item as per account. ✅
22. So creation from Cart. ✅
23. Inventory Icons design. ✅

24. Refactor SO process for Return.

---

11, 14, 17, 18

---

1. PO Page tabs design.
2. Create SIPL delete confirm modal.
3. Refactor payment pages, and test end to end.
4. remove old cart fns.
5. view RO confirmed RO data API change as per return.

---

1. If product is inactive it can’t be sold.
2. In create Customer first 3 section in one row. ✅
3. Customer details first 3 in single. ✅
4. Pick ticket -> loading order (in customer tab). ✅
5. Journal entry page. ✅
6. Deliveries UI (Initiate Deliveries and Create new Vehicle). ✅
7. Returns UI, Calculation and both type product feature. ✅
8. SIPL two step process. ✅
9. Vendor payment -> debit note to supplier if extra payment. ✅
10. Vendor payment. ✅
11. Advanced deposit design. -> due must be affected. ✅
12. Totals in customer payment.
13. Customer payment submit popup. ✅
14. Journal entry for credit note [Pending(what-is-account-for-credit-note-journal-entry) ()] and advanced deposit [is-this-one-is-correct]. ✅
15. Customer Payment journal entry.
16. Last closing entries in journal entries.
17. Cart to SO. ✅
18. Direct SIPL. ✅
19. Hold-Unhold. ✅
20. Customer details page tab scroll. ✅
21. cart item as per account. ✅
22. So creation from Cart. ✅
23. Inventory Icons design. ✅

---

1. Supplier SO inputs write and remove data then it accepting empty input.
2. Freight forwarder deselect. ✅
3. Other charges => services.
4. Hold notes with User optional. [!!!]
5. Swap. [!!!]
6. Cart count. ✅
7. Selection sheet. [!!!]
8. print.
9. share.

---

1. In receive inventory decimal has 3 digits -> change it to 2. ✅
2. Cancel design in receive inventory. ✅
3. Cancel redirection from receive inventory. ✅
4. Payment terms in create LO. ✅
5. Supplier SO inputs write and remove data then it accepting empty input. ✅
6. Table action Icon size correction. ✅
7. Freight forwarder deselect. ✅
8. Alert message design of receive inventory. ✅
9. add product after creating of SO. ✅
10. hold unhold management during swap. ✅

---

2. Swap. ✅
3. Required fields must be labeled with "\*". ✅
4. Phone number must be only 10 digit in Supplier and Customer.
5. Customer detail internal pages design.
6. Change initiate delivery process (first select invoices).
7. Slabs can't be added after receive inventory?
8. Delete button in SO before Invoice.

---

1. reusable components for Service

---

1. Add SO Products Available. ✅
2. Reference no. In Advance deposit. ✅
3. Validations in Advanced Deposit Popup. ✅
4. Create SO validations. ✅
5. Swap error due to BE table ✅
6. wrong data in SO Invoice. ✅
7. Calculations are wrong in Inventory. ✅

---

1. Service journal entry in PO. [!] [discussion]
2. Shortest path between delivery addresses. [skip-for-technical-reasons]

3. automate deployment [!!!!!!]
4. Freight bill could be edited (with journal entry).
5. Test whole project with generic product and combination of slab and generic products. [!]
6. Profile image
7. Change location access for user from client.
8. Show adjustments in separate module in sidebar.
9. Total area difference in split.
10. Sorting in table.
11. Cancel LO, SO
12. Dr. In Transit -> inventory variance in Journal entry
13. show generic PRoduct info as well in inventory drawer
14. add so product is showing slabs other than in_inventory. [!!!]

---

4. check if SlabRemeasurement table used anywhere.
5. remove loadingOrderProducts.
6. add new Locations.
