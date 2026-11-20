'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('trade_services');

    if (!tableDesc.appliedTo) {
      await queryInterface.addColumn('trade_services', 'appliedTo', {
        type: Sequelize.STRING(50),
        allowNull: true,
      });
    }

    if (!tableDesc.rateUnit) {
      await queryInterface.addColumn('trade_services', 'rateUnit', {
        type: Sequelize.STRING(50),
        allowNull: true,
      });
    }

    await queryInterface.sequelize.query(`
      ALTER TABLE trade_services
      MODIFY COLUMN referenceType ENUM(
        'packagingList',
        'loadingOrder',
        'sipl',
        'return',
        'salesOrder'
      ) NOT NULL
    `);
  },

  down: async (queryInterface) => {
    const tableDesc = await queryInterface.describeTable('trade_services');

    if (tableDesc.appliedTo) {
      await queryInterface.removeColumn('trade_services', 'appliedTo');
    }

    if (tableDesc.rateUnit) {
      await queryInterface.removeColumn('trade_services', 'rateUnit');
    }

    await queryInterface.sequelize.query(`
      ALTER TABLE trade_services
      MODIFY COLUMN referenceType ENUM(
        'packagingList',
        'loadingOrder',
        'sipl',
        'return'
      ) NOT NULL
    `);
  },
};
