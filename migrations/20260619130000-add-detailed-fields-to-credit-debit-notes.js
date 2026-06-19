'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('credit_debit_notes', 'creditNoteNumber', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('credit_debit_notes', 'creditNoteDate', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
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
    await queryInterface.addColumn('credit_debit_notes', 'reasonType', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('credit_debit_notes', 'remarks', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('credit_debit_notes', 'claimReferenceNumber', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('credit_debit_notes', 'inventoryImpactType', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('credit_debit_notes', 'inventoryAdjustmentValue', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('credit_debit_notes', 'creditNoteNumber');
    await queryInterface.removeColumn('credit_debit_notes', 'creditNoteDate');
    await queryInterface.removeColumn('credit_debit_notes', 'purchaseOrderId');
    await queryInterface.removeColumn('credit_debit_notes', 'reasonType');
    await queryInterface.removeColumn('credit_debit_notes', 'remarks');
    await queryInterface.removeColumn('credit_debit_notes', 'claimReferenceNumber');
    await queryInterface.removeColumn('credit_debit_notes', 'inventoryImpactType');
    await queryInterface.removeColumn('credit_debit_notes', 'inventoryAdjustmentValue');
  }
};
