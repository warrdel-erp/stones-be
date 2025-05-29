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
