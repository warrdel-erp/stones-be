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
29. const data as Jatin sent list.
30. fulfilled PO => how much sipl is created for given po product. in SINGLE PO, SINGLE SIPL
31. Bifurcate data of vendor according to type (supplier, freight, vendor)

---

payload validations.
model typescript support
remove any types

in product model (product.productName => product.name)
