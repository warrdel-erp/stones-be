"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // MySQL: alter ENUM by redefining the column with the new set of values
    // Update sales_order_products table
    const salesOrderProductsSql = `
      ALTER TABLE sales_order_products
      MODIFY COLUMN stage ENUM(
        'saleOrder',
        'loadingOrder',
        'packagingList',
        'invoiced',
        'closed'
      ) NOT NULL
    `;
    await queryInterface.sequelize.query(salesOrderProductsSql);

    // Update so_product_swap_histories table (also uses the same enum)
    const swapHistoriesSql = `
      ALTER TABLE so_product_swap_histories
      MODIFY COLUMN stage ENUM(
        'saleOrder',
        'loadingOrder',
        'packagingList',
        'invoiced',
        'closed'
      ) NOT NULL
    `;
    await queryInterface.sequelize.query(swapHistoriesSql);
  },

  async down(queryInterface, Sequelize) {
    // WARNING: This will fail if any rows currently use 'closed'
    // Revert so_product_swap_histories table
    const swapHistoriesSql = `
      ALTER TABLE so_product_swap_histories
      MODIFY COLUMN stage ENUM(
        'saleOrder',
        'loadingOrder',
        'packagingList',
        'invoiced'
      ) NOT NULL
    `;
    await queryInterface.sequelize.query(swapHistoriesSql);

    // Revert sales_order_products table
    const salesOrderProductsSql = `
      ALTER TABLE sales_order_products
      MODIFY COLUMN stage ENUM(
        'saleOrder',
        'loadingOrder',
        'packagingList',
        'invoiced'
      ) NOT NULL
    `;
    await queryInterface.sequelize.query(salesOrderProductsSql);
  },
};
