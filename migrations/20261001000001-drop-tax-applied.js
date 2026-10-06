'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('sales_order_products', 'tax_applied');
    } catch (e) {}
    
    try {
      await queryInterface.removeColumn('sales_order_requirement_lines', 'tax_applied');
    } catch (e) {}
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('sales_order_products', 'tax_applied', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      });
    } catch (e) {}

    try {
      await queryInterface.addColumn('sales_order_requirement_lines', 'tax_applied', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      });
    } catch (e) {}
  }
};
