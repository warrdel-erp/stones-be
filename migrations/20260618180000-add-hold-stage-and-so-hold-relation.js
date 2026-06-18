'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Check and add holdId to sales_orders table
    const salesOrderTableInfo = await queryInterface.describeTable('sales_orders');
    if (!salesOrderTableInfo.holdId) {
      await queryInterface.addColumn('sales_orders', 'holdId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'holds',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }

    // 2. Check and add stage to holds table
    const holdTableInfo = await queryInterface.describeTable('holds');
    if (!holdTableInfo.stage) {
      await queryInterface.addColumn('holds', 'stage', {
        type: Sequelize.ENUM('initiated', 'soCreated'),
        defaultValue: 'initiated',
        allowNull: false
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // 1. Remove holdId from sales_orders table
    const salesOrderTableInfo = await queryInterface.describeTable('sales_orders');
    if (salesOrderTableInfo.holdId) {
      await queryInterface.removeColumn('sales_orders', 'holdId');
    }

    // 2. Remove stage from holds table
    const holdTableInfo = await queryInterface.describeTable('holds');
    if (holdTableInfo.stage) {
      await queryInterface.removeColumn('holds', 'stage');
    }
  }
};
