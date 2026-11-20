'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('trade_services');
    if (!tableDesc.taxPercentage) {
      await queryInterface.addColumn('trade_services', 'taxPercentage', {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0,
      });
    }

    // Backfill taxPercentage for trade_services belonging to packaging_lists
    await queryInterface.sequelize.query(`
      UPDATE trade_services ts
      INNER JOIN packaging_lists pl ON ts.referenceId = pl.id AND ts.referenceType = 'packagingList'
      INNER JOIN sales_orders so ON pl.salesOrderId = so.id
      LEFT JOIN (
        SELECT 1 AS id, 6.0 AS val UNION SELECT 2, 7.0 UNION SELECT 3, 0.0 UNION SELECT 4, 8.9 
        UNION SELECT 5, 7.75 UNION SELECT 6, 6.0 UNION SELECT 7, 7.0 UNION SELECT 8, 8.0 
        UNION SELECT 9, 8.9 UNION SELECT 10, 7.0 UNION SELECT 11, 7.0 UNION SELECT 12, 6.0 
        UNION SELECT 13, 8.0 UNION SELECT 14, 8.0 UNION SELECT 15, 7.0 UNION SELECT 16, 7.0 
        UNION SELECT 17, 6.0 UNION SELECT 18, 7.0 UNION SELECT 19, 7.0 UNION SELECT 20, 7.0 
        UNION SELECT 21, 6.0 UNION SELECT 22, 8.0 UNION SELECT 23, 8.0 UNION SELECT 24, 7.0 
        UNION SELECT 25, 7.0 UNION SELECT 26, 8.0 UNION SELECT 27, 8.0
      ) taxes ON so.taxId = taxes.id
      SET ts.taxPercentage = COALESCE(taxes.val, 0)
    `);

    // Backfill taxPercentage for trade_services belonging to loading_orders
    await queryInterface.sequelize.query(`
      UPDATE trade_services ts
      INNER JOIN loading_orders lo ON ts.referenceId = lo.id AND ts.referenceType = 'loadingOrder'
      INNER JOIN sales_orders so ON lo.salesOrderId = so.id
      LEFT JOIN (
        SELECT 1 AS id, 6.0 AS val UNION SELECT 2, 7.0 UNION SELECT 3, 0.0 UNION SELECT 4, 8.9 
        UNION SELECT 5, 7.75 UNION SELECT 6, 6.0 UNION SELECT 7, 7.0 UNION SELECT 8, 8.0 
        UNION SELECT 9, 8.9 UNION SELECT 10, 7.0 UNION SELECT 11, 7.0 UNION SELECT 12, 6.0 
        UNION SELECT 13, 8.0 UNION SELECT 14, 8.0 UNION SELECT 15, 7.0 UNION SELECT 16, 7.0 
        UNION SELECT 17, 6.0 UNION SELECT 18, 7.0 UNION SELECT 19, 7.0 UNION SELECT 20, 7.0 
        UNION SELECT 21, 6.0 UNION SELECT 22, 8.0 UNION SELECT 23, 8.0 UNION SELECT 24, 7.0 
        UNION SELECT 25, 7.0 UNION SELECT 26, 8.0 UNION SELECT 27, 8.0
      ) taxes ON so.taxId = taxes.id
      SET ts.taxPercentage = COALESCE(taxes.val, 0)
    `);
  },

  down: async (queryInterface) => {
    const tableDesc = await queryInterface.describeTable('trade_services');
    if (tableDesc.taxPercentage) {
      await queryInterface.removeColumn('trade_services', 'taxPercentage');
    }
  },
};
