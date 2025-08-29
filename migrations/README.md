# Database Migrations

This directory contains all the database migrations for the Stone CRM Backend application. The migrations are designed to create the complete database schema in the correct order to handle foreign key dependencies.

## Migration Order

The migrations are numbered sequentially to ensure proper execution order. Here's the dependency flow:

### Base Tables (No Dependencies)

1. **001-create-accounts.js** - User authentication accounts
2. **002-create-clients.js** - Multi-tenant client organizations
3. **003-create-companies.js** - Company information
4. **004-create-locations.js** - Physical locations
5. **005-create-warehouses.js** - Warehouse locations (depends on locations)
6. **006-create-bins.js** - Storage bins (depends on warehouses)
7. **007-create-users.js** - User accounts (depends on accounts, clients, locations)

### Product Management

8. **008-create-product-groups.js** - Product categories (depends on users)
9. **009-create-product-sub-categories.js** - Product subcategories (depends on product groups)
10. **010-create-product-finishes.js** - Product finish types
11. **011-create-product-base-colors.js** - Product color types
12. **012-create-ledger-accounts.js** - Chart of accounts (depends on clients)
13. **013-create-products.js** - Product catalog (depends on multiple tables)

### Business Entities

14. **014-create-customers.js** - Customer information (depends on clients)
15. **015-create-vendors.js** - Vendor information (depends on clients)
16. **016-create-sales-orders.js** - Sales orders (depends on customers, clients, users)
17. **017-create-sales-order-products.js** - Sales order line items (depends on sales orders, products)
18. **018-create-inventory-products.js** - Inventory tracking (depends on bins, sipls)

### Purchasing & Inventory

19. **019-create-purchase-orders.js** - Purchase orders (depends on vendors, clients, users)
20. **020-create-journal-entries.js** - Accounting entries (depends on clients, users)
21. **021-create-bills.js** - Vendor bills (depends on vendors, clients, users)
22. **022-create-payments.js** - Payment records (depends on clients, users)
23. **023-create-sipls.js** - Shipping documents (depends on purchase orders, vendors, clients, users)
24. **024-create-loading-orders.js** - Loading orders (depends on sales orders, customers, trucks, clients, users)

### Logistics & Services

25. **025-create-trucks.js** - Delivery vehicles (depends on clients)
26. **026-create-advanced-deposits.js** - Customer deposits (depends on customers, clients, users)
27. **027-create-returns.js** - Product returns (depends on sales orders, customers, clients, users)
28. **028-create-services.js** - Service offerings (depends on service categories, clients, users)
29. **029-create-service-categories.js** - Service categories (depends on clients)
30. **031-create-slabs.js** - Stone slab inventory (depends on products, clients, users)

### Junction Tables

31. **031-create-user-locations.js** - User-location relationships (depends on users, locations)

### Additional Tables

32. **032-create-generic-products.js** - Generic product catalog (depends on clients, users)
33. **033-create-customer-addresses.js** - Customer address information (depends on customers)
34. **034-create-remaining-tables.js** - Containers, notes, trade services, and deliveries

## Running Migrations

### Prerequisites

- Ensure your database connection is configured in `src/config/database.ts`
- Make sure all required environment variables are set

### Commands

```bash
# Run all migrations
npx sequelize-cli db:migrate

# Run specific migration
npx sequelize-cli db:migrate --to 013-create-products.js

# Undo last migration
npx sequelize-cli db:migrate:undo

# Undo specific migration
npx sequelize-cli db:migrate:undo --to 012-create-ledger-accounts.js

# Undo all migrations
npx sequelize-cli db:migrate:undo:all

# Check migration status
npx sequelize-cli db:migrate:status
```

## Migration Structure

Each migration file follows this structure:

```javascript
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Migration logic to create/modify tables
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback logic to undo changes
  },
};
```

## Key Features

- **Foreign Key Constraints**: Proper referential integrity with CASCADE, RESTRICT, and SET NULL actions
- **Indexes**: Unique constraints and performance indexes where needed
- **Data Types**: Appropriate Sequelize data types matching the model definitions
- **Timestamps**: Standard `createdAt` and `updatedAt` fields for audit trails
- **Soft Deletes**: Some tables include `deletedAt` for soft delete functionality
- **Enums**: Proper ENUM types for status fields and categories

## Notes

- All tables include `clientId` for multi-tenancy support
- User audit fields (`createdBy`, `updatedBy`) are included where appropriate
- Foreign key relationships follow the model associations defined in the Sequelize models
- The migration order ensures that referenced tables exist before they are referenced

## Troubleshooting

If you encounter issues:

1. **Foreign Key Errors**: Ensure migrations are run in the correct order
2. **Duplicate Key Errors**: Check for existing data that might conflict with unique constraints
3. **Data Type Mismatches**: Verify that the migration data types match your model definitions
4. **Rollback Issues**: Use `db:migrate:undo:all` to reset completely if needed

## Adding New Migrations

When adding new migrations:

1. Use the next sequential number
2. Follow the existing naming convention
3. Ensure proper foreign key dependencies
4. Include both `up` and `down` methods
5. Test the migration and rollback process
6. Update this README with the new migration details
