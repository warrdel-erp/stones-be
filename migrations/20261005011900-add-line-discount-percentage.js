'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('sales_order_requirement_lines', 'line_discount_percentage', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('sales_order_products', 'lineDiscountPercentage', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('sales_order_requirement_lines', 'line_discount_percentage');
    await queryInterface.removeColumn('sales_order_products', 'lineDiscountPercentage');
  },
};
