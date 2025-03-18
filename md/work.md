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
    5. customer,
11. deploy.
12. check location belongs to client that is being assigned to user.
13. map every data and operation with location.
14. create client login
15. filter for PO,
16. sales Order process.
17. rollback every transaction.
18. restructure customer.
19. put all table relations in their specific model files.
20. po number should start from 1 for every client.
21. keep reference type of notes as enum.
22. vendor list according to type
23. check every update and create when it could be done. like after invoice lo can not be updated.
24. Retrieve notes data with SO
25. edit requested purchase order(get array of products, if id is null create one otherwise update) delete API.
26. send location, freight in PO, product in single PO
27. number of invoices in all PO details
28. vendor type national
29. const data as Jatin sent list. ✔️
30. fulfilled PO => how much sipl is created for given po product. in SINGLE PO, SINGLE SIPL ✔️
31. in salesOrderProduct combination of inventoryProductId and salesOrderId
32. po number, ✔️
33. sipl (po1 - sipl1, sipl2) according to PO ✔️
34. supplier invoice no. (custom number) ✔️
35. invoice no according to client ✔️
36. sipl product belongs to -> requested purchase product ✔️
37. single SIPL by detail by ID ✔️
38. vendor with type filter. ✔️
39. bill no. auto generated and API to get new BILL number ✔️

40. Add freight detail in SIPL single data and PO. ✔️
41. Receive inventory status in SIPL and receive date. ✔️
42. Sales Tax data in general ✔️

43. Slab in cart or not ✔️

44. Total fulfilled of requestedProducts in single PO ✔️
45. check in add slab is given siplProductId belongs to given SIPLId ✔️
46. Conditions for closing and canceling PO.

47. total receiving and packaging quantity in sipl products. ✔️
48. slab no. auto increment. ✔️
49. freight bill. ✔️
50. receive inventory data. ✔️
51. container saprate model ✔️
52. update slabs.
53. product more data like single slab price. ✔️
54. product tabs.
55. Set default user location error for not access.
56. SIPL detail Notes Populate.
57. drawer data in inventory.
58. keep everything in SIPL as in PO
59. add address in customer creation.

---

1. payload validations(req.body should not be passed directly to service.) .
2. model typescript support
3. remove any types
4. in product model (product.productName => product.name)
5. create flow diagram for every flow 48. put constants in tables for better data fetching
6. Restructure sipl calculations acc
7. Set value in getting model
