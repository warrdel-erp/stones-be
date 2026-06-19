'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('holds');
    if (!tableInfo.barcode) {
      await queryInterface.addColumn('holds', 'barcode', {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('holds');
    if (tableInfo.barcode) {
      await queryInterface.removeColumn('holds', 'barcode');
    }
  }
};
