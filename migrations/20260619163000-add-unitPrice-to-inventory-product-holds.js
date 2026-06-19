'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('inventory_product_holds');
    if (!tableInfo.unitPrice) {
      await queryInterface.addColumn('inventory_product_holds', 'unitPrice', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('inventory_product_holds');
    if (tableInfo.unitPrice) {
      await queryInterface.removeColumn('inventory_product_holds', 'unitPrice');
    }
  }
};
