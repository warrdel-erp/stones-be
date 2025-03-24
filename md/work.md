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

---

1. payload validations(req.body should not be passed directly to service.) .
2. model typescript support
3. remove any types
4. in product model (product.productName => product.name)
5. create flow diagram for every flow 48. put constants in tables for better data fetching
6. Restructure sipl calculations acc
7. Set value in getting model
