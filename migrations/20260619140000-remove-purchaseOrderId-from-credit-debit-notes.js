'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('credit_debit_notes', 'purchaseOrderId');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('credit_debit_notes', 'purchaseOrderId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'purchase_orders',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  }
};
