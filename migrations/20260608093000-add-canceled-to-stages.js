"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // MySQL: alter ENUM by redefining the column with the new set of values
    // Update packaging_lists table
    const plSql = `
      ALTER TABLE packaging_lists
      MODIFY COLUMN stage ENUM(
        'initiated',
        'loadingOrder',
        'invoiced',
        'canceled'
      ) NOT NULL DEFAULT 'initiated'
    `;
    await queryInterface.sequelize.query(plSql);

    // Update sales_order_products table
    const salesOrderProductsSql = `
      ALTER TABLE sales_order_products
      MODIFY COLUMN stage ENUM(
        'saleOrder',
        'loadingOrder',
        'packagingList',
        'invoiced',
        'closed',
        'canceled'
      ) NOT NULL DEFAULT 'saleOrder'
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
        'closed',
        'canceled'
      ) NOT NULL
    `;
    await queryInterface.sequelize.query(swapHistoriesSql);
  },

  async down(queryInterface, Sequelize) {
    // WARNING: This will fail if any rows currently use 'canceled'
    // Revert so_product_swap_histories table
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

    // Revert sales_order_products table
    const salesOrderProductsSql = `
      ALTER TABLE sales_order_products
      MODIFY COLUMN stage ENUM(
        'saleOrder',
        'loadingOrder',
        'packagingList',
        'invoiced',
        'closed'
      ) NOT NULL DEFAULT 'saleOrder'
    `;
    await queryInterface.sequelize.query(salesOrderProductsSql);

    // Revert packaging_lists table
    const plSql = `
      ALTER TABLE packaging_lists
      MODIFY COLUMN stage ENUM(
        'initiated',
        'loadingOrder',
        'invoiced'
      ) NOT NULL DEFAULT 'initiated'
    `;
    await queryInterface.sequelize.query(plSql);
  },
};
