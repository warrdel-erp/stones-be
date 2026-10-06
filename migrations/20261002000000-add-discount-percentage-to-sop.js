'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('sales_order_products', 'discountPercentage', {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0,
      });
    } catch (e) {
      console.log(e);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('sales_order_products', 'discountPercentage');
    } catch (e) {
      console.log(e);
    }
  }
};
