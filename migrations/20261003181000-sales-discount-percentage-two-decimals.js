'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Existing values are rounded to 2 decimal places by MySQL during the ALTER.
    await queryInterface.changeColumn('sales_orders', 'discountPercentage', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
    });
    await queryInterface.changeColumn('sales_order_invoices', 'discountPercentage', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('sales_orders', 'discountPercentage', {
      type: Sequelize.DECIMAL(15, 3),
      allowNull: true,
      defaultValue: 0,
    });
    await queryInterface.changeColumn('sales_order_invoices', 'discountPercentage', {
      type: Sequelize.DECIMAL(15, 3),
      allowNull: true,
      defaultValue: 0,
    });
  },
};
