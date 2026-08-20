'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('holds', 'supersededByQuotationId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('opportunity_quotations', 'supersededByHoldId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.changeColumn('holds', 'stage', {
      type: Sequelize.ENUM('initiated', 'soCreated', 'superseded'),
      allowNull: false,
      defaultValue: 'initiated'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('holds', 'supersededByQuotationId');
    await queryInterface.removeColumn('opportunity_quotations', 'supersededByHoldId');
    
    await queryInterface.changeColumn('holds', 'stage', {
      type: Sequelize.ENUM('initiated', 'soCreated'),
      allowNull: false,
      defaultValue: 'initiated'
    });
  }
};
