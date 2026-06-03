"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Disable foreign key checks
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");

    // 2. Rename tables
    await queryInterface.renameTable("loading_orders", "temp_loading_orders");
    await queryInterface.renameTable("packaging_lists", "loading_orders");
    await queryInterface.renameTable("temp_loading_orders", "packaging_lists");

    // 3. Rename columns in packaging_lists (old loading_orders)
    await queryInterface.renameColumn("packaging_lists", "clientLoNumber", "clientPlNumber");
    await queryInterface.renameColumn("packaging_lists", "soLoadingOrderNumber", "soPackagingListNumber");
    await queryInterface.renameColumn("packaging_lists", "loDate", "plDate");

    // 4. Rename columns in loading_orders (old packaging_lists)
    await queryInterface.renameColumn("loading_orders", "clientPlNumber", "clientLoNumber");
    await queryInterface.renameColumn("loading_orders", "soPackagingListNumber", "soLoadingOrderNumber");
    await queryInterface.renameColumn("loading_orders", "loadingOrderId", "packagingListId");

    // 6. Rename columns in sales_order_products
    await queryInterface.renameColumn("sales_order_products", "loadingOrderId", "temp_loadingOrderId");
    await queryInterface.renameColumn("sales_order_products", "packagingListId", "loadingOrderId");
    await queryInterface.renameColumn("sales_order_products", "temp_loadingOrderId", "packagingListId");

    await queryInterface.renameColumn("sales_order_products", "loRemeasureLength", "temp_loRemeasureLength");
    await queryInterface.renameColumn("sales_order_products", "plRemeasureLength", "loRemeasureLength");
    await queryInterface.renameColumn("sales_order_products", "temp_loRemeasureLength", "plRemeasureLength");

    await queryInterface.renameColumn("sales_order_products", "loRemeasureWidth", "temp_loRemeasureWidth");
    await queryInterface.renameColumn("sales_order_products", "plRemeasureWidth", "loRemeasureWidth");
    await queryInterface.renameColumn("sales_order_products", "temp_loRemeasureWidth", "plRemeasureWidth");

    // 7. Rename columns in so_product_swap_histories
    await queryInterface.renameColumn("so_product_swap_histories", "loRemeasureLength", "temp_loRemeasureLength");
    await queryInterface.renameColumn("so_product_swap_histories", "plRemeasureLength", "loRemeasureLength");
    await queryInterface.renameColumn("so_product_swap_histories", "temp_loRemeasureLength", "plRemeasureLength");

    await queryInterface.renameColumn("so_product_swap_histories", "loRemeasureWidth", "temp_loRemeasureWidth");
    await queryInterface.renameColumn("so_product_swap_histories", "plRemeasureWidth", "loRemeasureWidth");
    await queryInterface.renameColumn("so_product_swap_histories", "temp_loRemeasureWidth", "plRemeasureWidth");

    // 8. Rename columns in sales_order_invoices
    await queryInterface.renameColumn("sales_order_invoices", "loadingOrderId", "packagingListId");

    // 9. Rename columns in invoice_deliveries
    await queryInterface.renameColumn("invoice_deliveries", "loadingOrderId", "packagingListId");

    // 10. Modify ENUM column values for trade_services.referenceType
    await queryInterface.sequelize.query(`
      ALTER TABLE trade_services
      MODIFY COLUMN referenceType ENUM(
        'packagingList',
        'sipl',
        'return'
      ) NOT NULL
    `);

    // 11. Modify ENUM columns in journal_entries
    await queryInterface.sequelize.query(`
      ALTER TABLE journal_entries
      MODIFY COLUMN referenceType ENUM(
        'SIPL',
        'BILL',
        'PACKAGING_LIST',
        'PACKAGING_LIST_INVOICE',
        'SALES_ORDER',
        'RETURN',
        'ADVANCE_DEPOSIT'
      ) NULL
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE journal_entries
      MODIFY COLUMN entryFor ENUM(
        'SIPL',
        'PACKAGING_LIST',
        'RETURN'
      ) NULL
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE journal_entries
      MODIFY COLUMN subReferenceType ENUM(
        'sipl_product',
        'product',
        'slab',
        'bill_item',
        'bill',
        'packaging_list',
        'trade_service'
      ) NULL
    `);

    // 12. Modify ENUM columns in s3_files
    await queryInterface.sequelize.query(`
      ALTER TABLE s3_files
      MODIFY COLUMN entityType ENUM(
        'customer',
        'vendor',
        'product',
        'salesOrder',
        'purchaseOrder',
        'sipl',
        'inventoryProduct',
        'packagingList',
        'payment',
        'bill'
      ) NOT NULL
    `);

    // 13. Re-enable foreign key checks
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");

    await queryInterface.renameTable("packaging_lists", "temp_loading_orders");
    await queryInterface.renameTable("loading_orders", "packaging_lists");
    await queryInterface.renameTable("temp_loading_orders", "loading_orders");

    await queryInterface.renameColumn("loading_orders", "clientPlNumber", "clientLoNumber");
    await queryInterface.renameColumn("loading_orders", "soPackagingListNumber", "soLoadingOrderNumber");
    await queryInterface.renameColumn("loading_orders", "plDate", "loDate");

    await queryInterface.renameColumn("packaging_lists", "clientLoNumber", "clientPlNumber");
    await queryInterface.renameColumn("packaging_lists", "soLoadingOrderNumber", "soPackagingListNumber");
    await queryInterface.renameColumn("packaging_lists", "packagingListId", "loadingOrderId");

    await queryInterface.renameColumn("sales_order_products", "packagingListId", "temp_loadingOrderId");
    await queryInterface.renameColumn("sales_order_products", "loadingOrderId", "packagingListId");
    await queryInterface.renameColumn("sales_order_products", "temp_loadingOrderId", "loadingOrderId");

    await queryInterface.renameColumn("sales_order_products", "plRemeasureLength", "temp_loRemeasureLength");
    await queryInterface.renameColumn("sales_order_products", "loRemeasureLength", "plRemeasureLength");
    await queryInterface.renameColumn("sales_order_products", "temp_loRemeasureLength", "loRemeasureLength");

    await queryInterface.renameColumn("sales_order_products", "plRemeasureWidth", "temp_loRemeasureWidth");
    await queryInterface.renameColumn("sales_order_products", "loRemeasureWidth", "plRemeasureWidth");
    await queryInterface.renameColumn("sales_order_products", "temp_loRemeasureWidth", "loRemeasureWidth");

    await queryInterface.renameColumn("so_product_swap_histories", "plRemeasureLength", "temp_loRemeasureLength");
    await queryInterface.renameColumn("so_product_swap_histories", "loRemeasureLength", "plRemeasureLength");
    await queryInterface.renameColumn("so_product_swap_histories", "temp_loRemeasureLength", "loRemeasureLength");

    await queryInterface.renameColumn("so_product_swap_histories", "plRemeasureWidth", "temp_loRemeasureWidth");
    await queryInterface.renameColumn("so_product_swap_histories", "loRemeasureWidth", "plRemeasureWidth");
    await queryInterface.renameColumn("so_product_swap_histories", "temp_loRemeasureWidth", "loRemeasureWidth");

    await queryInterface.renameColumn("sales_order_invoices", "packagingListId", "loadingOrderId");

    await queryInterface.renameColumn("invoice_deliveries", "packagingListId", "loadingOrderId");

    await queryInterface.sequelize.query(`
      ALTER TABLE trade_services
      MODIFY COLUMN referenceType ENUM(
        'loadingOrder',
        'sipl',
        'return'
      ) NOT NULL
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE journal_entries
      MODIFY COLUMN referenceType ENUM(
        'SIPL',
        'BILL',
        'LOADING_ORDER',
        'LOADING_ORDER_INVOICE',
        'SALES_ORDER',
        'RETURN',
        'ADVANCE_DEPOSIT'
      ) NULL
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE journal_entries
      MODIFY COLUMN entryFor ENUM(
        'SIPL',
        'LOADING_ORDER',
        'RETURN'
      ) NULL
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE journal_entries
      MODIFY COLUMN subReferenceType ENUM(
        'sipl_product',
        'product',
        'slab',
        'bill_item',
        'bill',
        'loading_order',
        'trade_service'
      ) NULL
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE s3_files
      MODIFY COLUMN entityType ENUM(
        'customer',
        'vendor',
        'product',
        'salesOrder',
        'purchaseOrder',
        'sipl',
        'inventoryProduct',
        'loadingOrder',
        'payment',
        'bill'
      ) NOT NULL
    `);

    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");
  },
};
