'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Add `salesOrderInvoiceId` to `sales_order_products`
    await queryInterface.addColumn('sales_order_products', 'salesOrderInvoiceId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'sales_order_invoices',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // 2. Backfill existing invoiced products from `sales_order_invoices`
    // A. For loading order invoices:
    try {
      await queryInterface.sequelize.query(`
        UPDATE sales_order_products sop
        JOIN sales_order_invoices soi ON sop.loadingOrderId = soi.loadingOrderId
        SET sop.salesOrderInvoiceId = soi.id
        WHERE sop.loadingOrderId IS NOT NULL;
      `);
    } catch (e) {
      console.warn('Migration backfill for loading order invoices skipped/failed:', e.message);
    }

    // B. For packaging list invoices (that have no loadingOrderId):
    try {
      await queryInterface.sequelize.query(`
        UPDATE sales_order_products sop
        JOIN sales_order_invoices soi ON sop.packagingListId = soi.packagingListId
        SET sop.salesOrderInvoiceId = soi.id
        WHERE sop.packagingListId IS NOT NULL 
          AND sop.loadingOrderId IS NULL 
          AND sop.salesOrderInvoiceId IS NULL;
      `);
    } catch (e) {
      console.warn('Migration backfill for packaging list invoices skipped/failed:', e.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('sales_order_products', 'salesOrderInvoiceId');
  }
};
