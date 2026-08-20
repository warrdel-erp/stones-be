'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('sales_orders', 'opportunityId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'opportunities',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('sales_orders', 'quotationId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'opportunity_quotations',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('sales_orders', 'opportunityId');
    await queryInterface.removeColumn('sales_orders', 'quotationId');
  }
};
