'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Add fixedAmount to services table
    await queryInterface.addColumn('services', 'fixedAmount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });

    // 2. Add chargeType to trade_services table
    await queryInterface.addColumn('trade_services', 'chargeType', {
      type: Sequelize.ENUM('fixed', 'variable'),
      allowNull: false,
      defaultValue: 'variable',
    });

    // 3. Update referenceType ENUM on trade_services to include 'loadingOrder'
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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('services', 'fixedAmount');
    await queryInterface.removeColumn('trade_services', 'chargeType');
    await queryInterface.sequelize.query(`
      ALTER TABLE trade_services
      MODIFY COLUMN referenceType ENUM(
        'packagingList',
        'sipl',
        'return'
      ) NOT NULL
    `);
  },
};
