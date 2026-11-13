'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('sales_order_products');
    if (!tableDesc.soDiscountPercentage) {
      await queryInterface.addColumn('sales_order_products', 'soDiscountPercentage', {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
      });
    }

    // Backfill existing sales_order_products from their parent sales_orders.discountPercentage
    await queryInterface.sequelize.query(`
      UPDATE sales_order_products sop
      INNER JOIN sales_orders so ON sop.salesOrderId = so.id
      SET sop.soDiscountPercentage = COALESCE(so.discountPercentage, 0)
    `);

    // For already invoiced products via Loading Order, prefer the invoice's snapshot discountPercentage
    await queryInterface.sequelize.query(`
      UPDATE sales_order_products sop
      INNER JOIN sales_order_invoices soi ON soi.loadingOrderId = sop.loadingOrderId
      SET sop.soDiscountPercentage = COALESCE(soi.discountPercentage, sop.soDiscountPercentage, 0)
      WHERE sop.stage = 'invoiced'
        AND sop.loadingOrderId IS NOT NULL
    `);

    // For already invoiced products via Packaging List (without Loading Order), prefer the invoice's snapshot discountPercentage
    await queryInterface.sequelize.query(`
      UPDATE sales_order_products sop
      INNER JOIN sales_order_invoices soi ON soi.packagingListId = sop.packagingListId
      SET sop.soDiscountPercentage = COALESCE(soi.discountPercentage, sop.soDiscountPercentage, 0)
      WHERE sop.stage = 'invoiced'
        AND sop.loadingOrderId IS NULL
        AND sop.packagingListId IS NOT NULL
    `);
  },

  down: async (queryInterface) => {
    const tableDesc = await queryInterface.describeTable('sales_order_products');
    if (tableDesc.soDiscountPercentage) {
      await queryInterface.removeColumn('sales_order_products', 'soDiscountPercentage');
    }
  },
};
