# Migration Summary

This file provides a quick overview of all migrations created for the Stone CRM Backend application.

## Total Migrations Created: 34

### Core System Tables

1. **001-create-accounts.js** - User authentication
2. **002-create-clients.js** - Multi-tenant clients
3. **003-create-companies.js** - Company information
4. **004-create-locations.js** - Physical locations
5. **005-create-warehouses.js** - Warehouse management
6. **006-create-bins.js** - Storage bin management
7. **007-create-users.js** - User management

### Product Management

8. **008-create-product-groups.js** - Product categories
9. **009-create-product-sub-categories.js** - Product subcategories
10. **010-create-product-finishes.js** - Product finish types
11. **011-create-product-base-colors.js** - Product color types
12. **012-create-ledger-accounts.js** - Chart of accounts
13. **013-create-products.js** - Product catalog
14. **032-create-generic-products.js** - Generic products

### Business Entities

15. **014-create-customers.js** - Customer management
16. **015-create-vendors.js** - Vendor management
17. **033-create-customer-addresses.js** - Customer addresses

### Sales & Orders

18. **016-create-sales-orders.js** - Sales order management
19. **017-create-sales-order-products.js** - Sales order items
20. **024-create-loading-orders.js** - Loading order management
21. **027-create-returns.js** - Product returns

### Purchasing & Inventory

22. **019-create-purchase-orders.js** - Purchase order management
23. **023-create-sipls.js** - Shipping documents
24. **018-create-inventory-products.js** - Inventory tracking

### Financial Management

25. **020-create-journal-entries.js** - Accounting entries
26. **021-create-bills.js** - Vendor bills
27. **022-create-payments.js** - Payment records
28. **026-create-advanced-deposits.js** - Customer deposits

### Logistics & Services

29. **025-create-trucks.js** - Delivery vehicles
30. **028-create-services.js** - Service offerings
31. **029-create-service-categories.js** - Service categories
32. **030-create-slabs.js** - Stone slab inventory
33. **034-create-remaining-tables.js** - Containers, notes, trade services, deliveries

### Junction Tables

34. **031-create-user-locations.js** - User-location relationships

## Key Features

- **Multi-tenancy**: All tables include `clientId` for tenant isolation
- **Audit trails**: User tracking with `createdBy` and `updatedBy` fields
- **Timestamps**: Standard `createdAt` and `updatedAt` fields
- **Foreign keys**: Proper referential integrity with appropriate cascade rules
- **Indexes**: Performance optimization with unique constraints
- **Data types**: Appropriate Sequelize data types matching model definitions

## Migration Dependencies

The migrations are designed to run in sequence to handle foreign key dependencies:

```
Base Tables → Product Management → Business Entities → Sales & Orders →
Purchasing & Inventory → Financial Management → Logistics & Services → Junction Tables
```

## Running Migrations

```bash
# Run all migrations
npx sequelize-cli db:migrate

# Check status
npx sequelize-cli db:migrate:status

# Undo last migration
npx sequelize-cli db:migrate:undo

# Reset all (undo + re-run)
npx sequelize-cli db:migrate:undo:all && npx sequelize-cli db:migrate

# Use helper script
node src/migrations/run-migrations.js migrate
node src/migrations/run-migrations.js status
node src/migrations/run-migrations.js reset
```

## Notes

- All migrations include proper `up` and `down` methods for rollback
- Foreign key constraints use appropriate actions (CASCADE, RESTRICT, SET NULL)
- ENUM types are used for status fields and categories
- Some tables include soft delete functionality with `deletedAt` fields
- Unique constraints are applied where appropriate
- The migration order ensures data integrity during execution
