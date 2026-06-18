'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex('sales_orders', ['holdId'], {
      unique: true,
      name: 'unique_holdId_in_sales_orders'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('sales_orders', 'unique_holdId_in_sales_orders');
  }
};
